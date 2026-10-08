<template>
  <div class="encode-user-path">
    <label class="encode-user-path-field" for="encode-user-path-input">
      <span class="encode-user-path-label">科雷ID</span>
      <input
        id="encode-user-path-input"
        v-model="rawId"
        class="encode-user-path-input"
        type="text"
        autocomplete="off"
        autocapitalize="off"
        autocorrect="off"
        spellcheck="false"
        placeholder="例如：KU_AbCdEfGh"
      />
    </label>

    <p
      v-if="hint"
      class="encode-user-path-hint"
      :class="{ 'encode-user-path-hint--warn': invalidChars.length > 0 }"
    >
      {{ hint }}
    </p>

    <div class="encode-user-path-result">
      <span class="encode-user-path-result-label">编码结果</span>

      <p
        class="encode-user-path-result-value"
        :class="{ 'is-placeholder': !encoded }"
        aria-live="polite"
      >
        {{ resultText }}
      </p>

      <div v-if="encoded" class="encode-user-path-result-foot">
        <span class="encode-user-path-groups">分组：{{ groups.join(" / ") }}</span>
        <button class="encode-user-path-copy" type="button" @click="copy">
          {{ copied ? "已复制" : "复制" }}
        </button>
      </div>
    </div>
    <div class="encode-user-path-result">
      <span class="encode-user-path-result-label">路径编码结果</span>

      <p
        class="encode-user-path-result-value"
        :class="{ 'is-placeholder': !encoded }"
        aria-live="polite"
      >
        <span v-if="resultText===PLACEHOLDER">
          {{ resultText }}
        </span>
        <span v-else>
          .klei/DoNotStarveTogether/Cluster_{房间ID}/{世界名}/save/session/{session ID}/{{ resultText }}
        </span>
      </p>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";

/** 饥荒编码用户路径时使用的字符表，共 64 个字符 */
const LIST = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";

const PLACEHOLDER = "输入科雷ID后，这里会实时显示编码结果";

/** 空格、换行等字符直接展示看不出来，提示时换成可读的名字 */
const CHAR_NAMES: Record<string, string> = {
  " ": "空格",
  "\t": "制表符",
  "\n": "换行",
  "\r": "回车",
};

const rawId = ref("");
const copied = ref(false);

let copyTimer: ReturnType<typeof setTimeout> | undefined;

/** 去掉首尾空白，避免粘贴时把多余的空格、换行带进编码 */
const userId = computed(() => rawId.value.trim());

/** 字符表之外的字符，会导致编码结果出现 undefined，因此先校验再编码 */
const invalidChars = computed(() =>
  [...new Set([...userId.value].filter((char) => !LIST.includes(char)))],
);

/** 非法字符的可读写法，用于提示文案 */
const invalidCharText = computed(() =>
  invalidChars.value.map((char) => CHAR_NAMES[char] ?? char).join(" "),
);

/**
 * 编码逻辑与饥荒服务端保持一致：
 * ① 第 3 个字符为 “_” 时先移除（科雷ID形如 KU_xxxxxxxx）
 * ② 按每 5 个字符分组，组内自左向右以 2 的幂为进制重新编码
 */
function encode(str: string): string {
  const text = withoutIdUnderscore(str);

  // 按每 5 个字符分组
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += 5) chunks.push(text.substring(i, i + 5));

  let resultStr = "";

  for (const v of chunks) {
    let base = 2;
    let result = "0";
    const len = v.length;

    for (let i = 0; i < len; i++) {
      const pos = LIST.indexOf(v[i]);

      // 理论上不会发生，校验漏掉时直接返回空串，避免输出 undefined
      if (pos < 0) return "";

      // 从 list 中按 base 周期取样，作为追加到末尾的字符
      const value = LIST[Math.floor((32 / base) * (pos % base))];

      // 计算最后一个字符的新位置
      const lastPos = LIST.indexOf(result[result.length - 1]) + Math.floor(pos / base);
      const last = LIST[lastPos];

      // 替换最后一个字符，并追加 value
      result = result.slice(0, -1) + last + value;

      base *= 2;
    }

    resultStr += result;
  }

  return resultStr;
}

/** 科雷ID的第 3 位 “_” 只是分隔符，编码前需要去掉 */
function withoutIdUnderscore(str: string): string {
  return str.substring(2, 3) === "_" ? str.substring(0, 2) + str.substring(3) : str;
}

/** 与 encode 相同的分组方式，用于在界面上展示分组明细 */
function splitGroups(str: string): string[] {
  const text = withoutIdUnderscore(str);
  const result: string[] = [];

  for (let i = 0; i < text.length; i += 5) result.push(text.substring(i, i + 5));

  return result;
}

const encoded = computed(() =>
  userId.value && invalidChars.value.length === 0 ? encode(userId.value) : "",
);

const groups = computed(() => (encoded.value ? splitGroups(userId.value) : []));

/** 输入框为空时展示提示文案，输入非法字符时明确告知无法编码 */
const resultText = computed(() => {
  if (encoded.value) return encoded.value;

  return userId.value && invalidChars.value.length > 0 ? "无法编码" : PLACEHOLDER;
});

const hint = computed(() => {
  if (!userId.value) return "";

  if (invalidChars.value.length)
    return `包含无法编码的字符：${invalidCharText.value}，请确认科雷ID是否复制完整`;

  if (userId.value.substring(2, 3) === "_")
    return "检测到第 3 个字符是 “_”，已按饥荒的规则自动去掉";

  return "";
});

/* --------------------------------- 复制结果 --------------------------------- */

async function copy(): Promise<void> {
  if (!encoded.value) return;

  try {
    await navigator.clipboard.writeText(encoded.value);
  } catch {
    // 非 HTTPS 或浏览器不支持剪贴板 API 时，降级为临时输入框选中复制
    const textarea = document.createElement("textarea");
    textarea.value = encoded.value;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.top = "-1000px";
    textarea.style.opacity = "0";
    document.body.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }

  copied.value = true;

  if (copyTimer) clearTimeout(copyTimer);
  copyTimer = setTimeout(() => {
    copied.value = false;
  }, 1600);
}

watch(userId, () => {
  copied.value = false;
});

onUnmounted(() => {
  if (copyTimer) clearTimeout(copyTimer);
});
</script>

<style lang="scss" scoped>
.encode-user-path {
  --eup-border: var(--vp-c-divider, #e2e2e3);
  --eup-surface: var(--vp-c-bg-alt, #f6f6f7);
  --eup-text-weak: var(--vp-c-text-2, #6b6b6b);
  --eup-brand: var(--vp-c-brand-1, #3eaf7c);
  --eup-warning: var(--vp-c-warning-1, #b8860b);

  padding: 16px 18px;
  margin: 16px 0;
  background: var(--eup-surface);
  border: 1px solid var(--eup-border);
  border-radius: 10px;
}

.encode-user-path-field {
  display: block;
}

.encode-user-path-label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--eup-text-weak);
}

.encode-user-path-input {
  box-sizing: border-box;
  display: block;
  width: 100%;
  padding: 8px 12px;
  font-family: var(--vp-font-family-mono, monospace);
  font-size: 1rem;
  color: var(--vp-c-text-1, #2c3e50);
  background: var(--vp-c-bg, #fff);
  border: 1px solid var(--eup-border);
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: var(--eup-brand);
  }
}

.encode-user-path-hint {
  margin: 8px 0 0;
  font-size: 0.85rem;
  color: var(--eup-text-weak);
}

.encode-user-path-hint--warn {
  color: var(--eup-warning);
}

.encode-user-path-result {
  padding: 12px 14px;
  margin-top: 14px;
  background: var(--vp-c-bg, #fff);
  border: 1px solid var(--eup-border);
  border-radius: 8px;
}

.encode-user-path-result-label {
  font-size: 0.8rem;
  color: var(--eup-text-weak);
}

.encode-user-path-result-value {
  margin: 4px 0 0;
  font-family: var(--vp-font-family-mono, monospace);
  font-size: 1.05rem;
  overflow-wrap: anywhere;

  &.is-placeholder {
    font-family: inherit;
    font-size: 0.9rem;
    color: var(--eup-text-weak);
  }
}

.encode-user-path-result-foot {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  margin-top: 10px;
  font-size: 0.8rem;
  color: var(--eup-text-weak);
  border-top: 1px dashed var(--eup-border);
}

.encode-user-path-groups {
  overflow-wrap: anywhere;
}

.encode-user-path-copy {
  padding: 2px 12px;
  font-size: 0.8rem;
  color: var(--eup-text-weak);
  cursor: pointer;
  background: var(--vp-c-bg, #fff);
  border: 1px solid var(--eup-border);
  border-radius: 6px;

  &:hover {
    color: var(--eup-brand);
    border-color: var(--eup-brand);
  }
}
</style>
