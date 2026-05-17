<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { CreateMLCEngine } from '@mlc-ai/web-llm';
import systemPrompt from '../data/oleg-context.md?raw';

const MODEL = 'Llama-3.2-1B-Instruct-q4f16_1-MLC';

type Message = { role: 'user' | 'assistant'; content: string };

const messages = ref<Message[]>([]);
const input = ref('');
const status = ref<'loading' | 'ready' | 'generating'>('loading');
const loadingText = ref('Loading…');
const chatEl = ref<HTMLElement | null>(null);

let engine: Awaited<ReturnType<typeof CreateMLCEngine>> | null = null;

const suggestions = [
  'What do you do at Hiive?',
  'Recommend a recipe',
  'Tell me about your courses',
  'How can I reach you?',
];

onMounted(async () => {
  engine = await CreateMLCEngine(MODEL, {
    initProgressCallback: (p) => {
      const pct = Math.round((p.progress ?? 0) * 100);
      loadingText.value = `Loading Oleg's brain… ${pct}%`;
    },
  });
  status.value = 'ready';
});

async function scrollToBottom() {
  await nextTick();
  if (chatEl.value) chatEl.value.scrollTop = chatEl.value.scrollHeight;
}

async function submit() {
  const text = input.value.trim();
  if (!text || !engine || status.value !== 'ready') return;

  input.value = '';
  messages.value.push({ role: 'user', content: text });
  await scrollToBottom();

  status.value = 'generating';
  messages.value.push({ role: 'assistant', content: '' });
  const assistantIdx = messages.value.length - 1;

  const stream = await engine.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.value.slice(0, -1),
    ],
    stream: true,
    temperature: 0.3,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? '';
    messages.value[assistantIdx].content += delta;
    await scrollToBottom();
  }

  status.value = 'ready';
}

function useSuggestion(q: string) {
  input.value = q;
  submit();
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    submit();
  }
}
</script>

<template>
  <!-- Chat bubbles -->
  <div
    v-if="messages.length > 0 || status === 'loading'"
    ref="chatEl"
    class="flex flex-col gap-4 pb-2"
  >
    <!-- Loading state -->
    <div v-if="status === 'loading'" class="flex flex-col gap-1">
      <span class="font-mono text-xs tracking-widest text-terra uppercase">OLEG</span>
      <div class="bg-orange-100 border border-orange-100 rounded-2xl px-4 py-3 text-sm text-gray-500 max-w-sm">
        {{ loadingText }}
      </div>
    </div>

    <template v-for="(msg, i) in messages" :key="i">
      <!-- User message -->
      <div v-if="msg.role === 'user'" class="flex justify-end">
        <span class="bg-gray-900 text-white rounded-full px-4 py-2 text-sm max-w-xs text-right">
          {{ msg.content }}
        </span>
      </div>

      <!-- Assistant message -->
      <div v-else class="flex flex-col gap-1">
        <span class="font-mono text-xs tracking-widest text-terra uppercase">OLEG</span>
        <div class="bg-orange-100 border border-orange-100 rounded-2xl px-4 py-3 text-sm text-gray-800 max-w-sm leading-relaxed">
          <span v-if="msg.content">{{ msg.content }}</span>
          <span v-else class="text-gray-400 animate-pulse">…</span>
        </div>
      </div>
    </template>
  </div>

  <!-- Input box -->
  <div class="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
    <textarea
      v-model="input"
      placeholder="Ask me anything…"
      rows="2"
      :disabled="status !== 'ready'"
      class="font-body w-full bg-transparent leading-relaxed text-gray-800 placeholder-gray-400 outline-none resize-none disabled:opacity-50"
      @keydown="onKeydown"
    />
    <div class="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
      <span class="font-mono flex items-center gap-2 text-xs tracking-widest text-gray-400 uppercase">
        <span
          class="h-1.5 w-1.5 rounded-full transition-colors"
          :class="status === 'ready' ? 'bg-terra' : 'bg-gray-300 animate-pulse'"
        />
        Oleg's page
      </span>
      <button
        :disabled="status !== 'ready' || !input.trim()"
        class="flex items-center gap-1.5 rounded-full bg-terra px-4 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        @click="submit"
      >
        Ask <span>→</span>
      </button>
    </div>
  </div>

  <!-- Suggestion pills -->
  <div class="flex justify-center flex-wrap gap-2">
    <button
      v-for="q in suggestions"
      :key="q"
      :disabled="status !== 'ready'"
      class="font-body rounded-full border border-gray-300 bg-transparent px-4 py-1.5 text-xs text-gray-600 hover:border-terra hover:text-gray-800 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      @click="useSuggestion(q)"
    >
      {{ q }}
    </button>
  </div>
</template>
