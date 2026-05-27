/**
 * Vapi function-tool adapter for Claire's shared agent-tools surface.
 *
 * The web-chat route hands `buildAgentTools()` directly to AI SDK's
 * `streamText`, which runs the tool-use loop internally. Vapi takes the
 * opposite approach: the model lives on Vapi's side, and Vapi POSTs to
 * our server URL with a `tool-calls` event whenever the model wants to
 * run a function. So we need two adapters:
 *
 * 1. `buildVapiFunctionDefinitions(ctx)` — converts each AI SDK `tool()`
 *    (Zod inputSchema) into Vapi's expected function-tool JSON shape
 *    (name + description + JSON-schema parameters). Returned in the
 *    assistant config we hand back at `assistant-request`.
 *
 * 2. `executeVapiToolCall({ name, args, ctx })` — runs the matching
 *    tool's `execute()` and returns whatever the tool returned. The
 *    voice route wraps this with persistence + a Vapi-shaped response
 *    envelope.
 *
 * Tool side-effects (HCP writes, Resend emails, conversation status
 * changes) are identical across channels because the underlying tool
 * implementations don't know which channel called them. Only the
 * `AgentToolContext.channel` differs.
 */
import { z } from 'zod'

import { buildAgentTools, type AgentToolContext } from './agent-tools'

export type VapiFunctionTool = {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

type LooseTool = {
  description?: string
  inputSchema?: z.ZodTypeAny
  execute?: (args: unknown, opts?: unknown) => Promise<unknown> | unknown
}

function asLooseTools(ctx: AgentToolContext): Record<string, LooseTool> {
  return buildAgentTools(ctx) as unknown as Record<string, LooseTool>
}

export function buildVapiFunctionDefinitions(ctx: AgentToolContext): VapiFunctionTool[] {
  const tools = asLooseTools(ctx)
  const out: VapiFunctionTool[] = []
  for (const [name, tool] of Object.entries(tools)) {
    const description = tool.description ?? ''
    const parameters = tool.inputSchema
      ? toJsonSchema(tool.inputSchema)
      : { type: 'object', properties: {}, additionalProperties: false }
    out.push({
      type: 'function',
      function: { name, description, parameters },
    })
  }
  return out
}

export type VapiToolCall = {
  /** Vapi's id for this individual tool call within the call. Echo it back. */
  id: string
  /**
   * Vapi sends tool calls in OpenAI's nested function-tool format:
   *   { id, type: 'function', function: { name, arguments: string } }
   * `arguments` is a JSON-stringified object, not a parsed object.
   */
  function?: {
    name?: string
    arguments?: string | Record<string, unknown>
  }
  /** Legacy / fallback top-level shape. Vapi never seems to send this, but
   * accept it so we don't regress if their payload shape changes again. */
  name?: string
  arguments?: Record<string, unknown>
  parameters?: Record<string, unknown>
}

export type ExecuteVapiToolCallInput = {
  ctx: AgentToolContext
  call: VapiToolCall
}

export type ExecuteVapiToolCallResult = {
  toolCallId: string
  name: string
  /** Stringified JSON of whatever the tool returned, per Vapi's contract. */
  result: string
  /** Set when the tool name doesn't exist or args fail validation. */
  error?: string
}

/**
 * Extract the function name and parsed arguments from a Vapi tool-call
 * payload. Handles both Vapi's actual nested format (`function.name`,
 * `function.arguments` as a JSON string) and the legacy top-level shape
 * as a fallback.
 *
 * Pre-2026-05-27 this codebase only read `call.name` and `call.arguments`,
 * which meant every voice tool call across every live call returned
 * "Unknown tool: undefined" silently. Fixed by unwrapping `function.*`
 * here and at the persistence site in voice/server/route.ts.
 */
export function extractVapiCall(call: VapiToolCall): {
  name: string | null
  args: Record<string, unknown>
} {
  const name = call.function?.name ?? call.name ?? null

  let args: Record<string, unknown> = {}
  const rawFnArgs = call.function?.arguments
  if (typeof rawFnArgs === 'string') {
    try {
      const parsed = JSON.parse(rawFnArgs)
      if (parsed && typeof parsed === 'object') {
        args = parsed as Record<string, unknown>
      }
    } catch {
      // Bad JSON. Leave args empty so Zod surfaces a clear validation error.
      args = {}
    }
  } else if (rawFnArgs && typeof rawFnArgs === 'object') {
    args = rawFnArgs as Record<string, unknown>
  } else if (call.arguments && typeof call.arguments === 'object') {
    args = call.arguments
  } else if (call.parameters && typeof call.parameters === 'object') {
    args = call.parameters
  }

  return { name, args }
}

export async function executeVapiToolCall(
  input: ExecuteVapiToolCallInput,
): Promise<ExecuteVapiToolCallResult> {
  const { ctx, call } = input
  const { name, args } = extractVapiCall(call)

  if (!name) {
    return {
      toolCallId: call.id,
      name: 'unknown',
      result: JSON.stringify({
        ok: false,
        error: 'Vapi tool call missing function.name. Cannot route.',
      }),
      error: 'Missing function.name in Vapi tool-call payload',
    }
  }

  const tools = asLooseTools(ctx)
  const tool = tools[name]
  if (!tool || typeof tool.execute !== 'function') {
    return {
      toolCallId: call.id,
      name,
      result: JSON.stringify({ ok: false, error: `Unknown tool: ${name}` }),
      error: `Unknown tool: ${name}`,
    }
  }

  let parsedArgs: unknown = args
  if (tool.inputSchema) {
    const parsed = tool.inputSchema.safeParse(args)
    if (!parsed.success) {
      const issues = parsed.error.issues
        .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
        .join('; ')
      return {
        toolCallId: call.id,
        name,
        result: JSON.stringify({ ok: false, error: `Invalid arguments: ${issues}` }),
        error: `Invalid arguments: ${issues}`,
      }
    }
    parsedArgs = parsed.data
  }

  try {
    const result = await tool.execute(parsedArgs, {
      // AI SDK passes a context object including `toolCallId` and
      // `messages`. We mimic just enough so tools that look at it don't
      // throw, but most of ours don't read it at all.
      toolCallId: call.id,
      messages: [],
    })
    return {
      toolCallId: call.id,
      name,
      result: typeof result === 'string' ? result : JSON.stringify(result ?? null),
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error(`[vapi-tools] ${name} threw:`, e)
    return {
      toolCallId: call.id,
      name,
      result: JSON.stringify({ ok: false, error: `Tool failed: ${message}` }),
      error: message,
    }
  }
}

/**
 * Convert a Zod schema to JSON Schema for Vapi's `function.parameters`
 * field. Zod 4 ships `z.toJSONSchema` natively. We strip the top-level
 * `$schema` URL since Vapi doesn't need it and it bloats the payload.
 */
function toJsonSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  const raw = z.toJSONSchema(schema, { target: 'draft-2020-12' }) as Record<string, unknown>
  // Vapi doesn't read $schema; drop it to keep prompts small.
  if ('$schema' in raw) delete raw.$schema
  return raw
}
