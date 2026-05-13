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
  name: string
  /** Vapi passes either `arguments` (object) or `parameters` (object). Accept both. */
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

export async function executeVapiToolCall(
  input: ExecuteVapiToolCallInput,
): Promise<ExecuteVapiToolCallResult> {
  const { ctx, call } = input
  const tools = asLooseTools(ctx)
  const tool = tools[call.name]
  if (!tool || typeof tool.execute !== 'function') {
    return {
      toolCallId: call.id,
      name: call.name,
      result: JSON.stringify({ ok: false, error: `Unknown tool: ${call.name}` }),
      error: `Unknown tool: ${call.name}`,
    }
  }

  const rawArgs = call.arguments ?? call.parameters ?? {}
  let parsedArgs: unknown = rawArgs
  if (tool.inputSchema) {
    const parsed = tool.inputSchema.safeParse(rawArgs)
    if (!parsed.success) {
      const issues = parsed.error.issues
        .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
        .join('; ')
      return {
        toolCallId: call.id,
        name: call.name,
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
      name: call.name,
      result: typeof result === 'string' ? result : JSON.stringify(result ?? null),
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error(`[vapi-tools] ${call.name} threw:`, e)
    return {
      toolCallId: call.id,
      name: call.name,
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
