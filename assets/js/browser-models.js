import { copyText } from './copy.js';
// One catalog for the site picker and Lab. Numbers are observations, not ratings.
export const WEBLLM = 'https://esm.run/@mlc-ai/web-llm@0.2.85';
export const WASM_REVISION = '025bcaf3780fa8254f5e5efd3bfea0a5397248f4';
export const DEFAULT_BROWSER_MODEL = 'Qwen3.5-0.8B-q4f16_1-MLC';
export const BROWSER_MODELS = [
  { label: 'SmolLM2 360M', id: 'SmolLM2-360M-Instruct-q4f16_1-MLC', revision: '3a622fd89e0216e8bb10c410c007c786baa8a033',
    mb: 204, vram: 376, load: 11.43, firstToken: 1.23, reply: 2.04, tokensPerSecond: 48.17,
    get finding() { return copyText('model_findings.smollm_small'); },
    reviewKey: 'smollm_small' },
  { label: 'Qwen3 0.6B', id: 'Qwen3-0.6B-q4f16_1-MLC', revision: '8c14ce481d4c692769976ad52afea453a102df19',
    mb: 335, vram: 1403, load: 16.22, firstToken: 1.51, reply: 2.38, tokensPerSecond: 35.78,
    get finding() { return copyText('model_findings.qwen_small'); },
    reviewKey: 'qwen_small' },
  { label: 'Qwen3.5 0.8B', id: 'Qwen3.5-0.8B-q4f16_1-MLC', revision: '0ec138972555613c1d7812a821778ad0398c8790',
    mb: 424, vram: 1629, load: 20.82, firstToken: 2.28, reply: 5.34, tokensPerSecond: 26.25,
    get finding() { return copyText('model_findings.qwen_default'); },
    reviewKey: 'qwen_default' },
  { label: 'Gemma 3 1B', id: 'gemma3-1b-it-q4f16_1-MLC', revision: '0f6103ed635931ff91a95db543365f0a77cbfb7d',
    mb: 563, vram: 711, load: 26.85, firstToken: null, reply: null, tokensPerSecond: null,
    get finding() { return copyText('model_findings.gemma'); },
    reviewKey: 'gemma' },
  { label: 'SmolLM2 1.7B', id: 'SmolLM2-1.7B-Instruct-q4f16_1-MLC', revision: '84f57f8580a9d8d623266b600ad4273bb9fd84c1',
    mb: 963, vram: 1774, load: 29.83, firstToken: 4.92, reply: 7.10, tokensPerSecond: 21.99,
    get finding() { return copyText('model_findings.smollm_large'); },
    reviewKey: 'smollm_large' },
  { label: 'Qwen3 1.7B', id: 'Qwen3-1.7B-q4f16_1-MLC', revision: '80b3abcec6c3b3f5355dc0cc99cc4fb578f192bc',
    mb: 968, vram: 2037, load: 37.03, firstToken: 3.84, reply: 5.17, tokensPerSecond: 20.08,
    get finding() { return copyText('model_findings.qwen_large'); },
    reviewKey: 'qwen_large' },
].map(m => Object.assign(m, { note: `${m.mb} MB download · ~${(m.vram / 1000).toFixed(2)} GB GPU${m.id === DEFAULT_BROWSER_MODEL ? ' · default' : ''}${m.id.startsWith('gemma3-') ? ' · known issues' : ''}` }));

export function appConfig(prebuilt) {
  const pinned = BROWSER_MODELS.map(m => {
    const preset = prebuilt.model_list.find(p => p.model_id === m.id);
    if (!preset) throw new Error('Missing model preset: ' + m.id);
    return { ...preset, model: `https://huggingface.co/mlc-ai/${m.id}/resolve/${m.revision}/`,
      model_lib: preset.model_lib.replace('/main/', `/${WASM_REVISION}/`),
      overrides: { ...preset.overrides, ...(m.id.startsWith('gemma3-') ? { sliding_window_size: -1 } : {}) } };
  });
  // Retain old presets so an existing visitor's explicitly saved choice works.
  return { ...prebuilt, model_list: [...pinned,
    ...prebuilt.model_list.filter(p => !BROWSER_MODELS.some(m => m.id === p.model_id))] };
}

export function chatRequest(id, messages, options = {}) {
  if (id.startsWith('gemma3-') && messages[0]?.role === 'system') {
    const [instructions, first, ...rest] = messages;
    messages = [{ role: 'user', content: instructions.content + '\n\n' + (first?.content || '') }, ...rest];
  }
  return { messages, max_tokens: 400, temperature: 0, seed: 42, ...options,
    ...(/^Qwen3(?:\.5)?-/.test(id) ? { extra_body: { enable_thinking: false } } : {}) };
}

export function cleanReply(text = '') {
  return text.replace(/<think>[\s\S]*?(?:<\/think>|$)/g, '').replace(/<(?:t(?:h(?:i(?:n(?:k)?)?)?)?)?$/, '').trim();
}
