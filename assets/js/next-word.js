// WebLLM reports post-temperature logprobs. Measuring at zero destroys the
// alternatives; measure at one and let the caller follow the strongest token.
export const WORD_ODDS_REQUEST = Object.freeze({ max_tokens: 1, temperature: 1,
  top_p: 1, repetition_penalty: 1, frequency_penalty: 0, presence_penalty: 0,
  logprobs: true, top_logprobs: 5, seed: 42 });

export function parseTop(r) {
  const lp = r?.choices?.[0]?.logprobs;
  const first = lp?.content?.[0]?.top_logprobs;
  const legacy = lp?.top_logprobs?.[0];
  const candidates = first?.length ? first : legacy && Object.entries(legacy).map(([token, logprob]) => ({ token, logprob }));
  if (!candidates?.length) return null;
  return candidates.filter(c => typeof c.token === 'string' && Number.isFinite(c.logprob))
    .map(({ token, logprob }) => ({ token, logprob })).sort((a, b) => b.logprob - a.logprob);
}

export const isEndToken = token => /^(?:<\|(?:endoftext|im_end|eot_id)\|>|<eos>|<\/s>|<end_of_turn>)$/.test(token);
