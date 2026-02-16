<script setup lang='ts'>
import type { CSSProperties } from 'vue'
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { rgbToHex } from '@/utils/color'

interface Props {
    textSize: number
    textColor: string
    topTitle: string
    tableData: any[]
    setDefaultPersonList: () => void
    isInitialDone: boolean
    titleFont: string
    currentStatus: number
    currentPrize: any
    isShowPrize: boolean
    titleFontSyncGlobal: boolean
}

const props = defineProps<Props>()
const router = useRouter()
const { tableData, textSize, textColor, topTitle, setDefaultPersonList, titleFont, titleFontSyncGlobal, currentStatus, currentPrize, isShowPrize } = toRefs(props)
const isTextColor = computed(() => {
    return rgbToHex(textColor.value) !== '#00000000'
})
const titleStyle = computed(() => {
    const style: CSSProperties = {
        fontSize: `${textSize.value * 1.5}px`,
    }
    if (!titleFontSyncGlobal.value) {
        style.fontFamily = titleFont.value
    }
    if (isTextColor.value) {
        style.color = textColor.value
    }

    return style
})

const prizeNameStyle = computed(() => {
    const style: CSSProperties = {
        fontSize: `${textSize.value * 2.5}px`, // Larger font size for prize name
        fontWeight: 'bold',
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 100,
        whiteSpace: 'nowrap',
    }
    if (!titleFontSyncGlobal.value) {
        style.fontFamily = titleFont.value
    }
    if (isTextColor.value) {
        style.color = textColor.value
    }
    return style
})

const { t } = useI18n()
</script>

<template>
  <div class="absolute z-10 flex flex-col items-center justify-center -translate-x-1/2 left-1/2">
    <h2
      class="pt-12 m-0 mb-12 tracking-wide text-center leading-12"
      :class="{ 'animate-pulse bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent': !isTextColor }"
      :style="titleStyle"
    >
      {{ topTitle }}
    </h2>
    <div v-if="isInitialDone" class="flex gap-3">
      <button
        v-if="tableData.length <= 0" class="cursor-pointer btn btn-outline btn-secondary btn-lg"
        @click="router.push('config')"
      >
        {{ t('button.noInfoAndImport') }}
      </button>
      <!-- <button
        v-if="tableData.length <= 0" class="cursor-pointer btn btn-outline btn-secondary btn-lg"
        @click="setDefaultPersonList"
      >
        {{ t('button.useDefault') }}
      </button> -->
    </div>
    <!-- 加載中 -->
    <div v-else class="flex gap-3 items-center">
      <span class="loading loading-spinner loading-xl" />
      <span>{{ t('button.loading') }}</span>
    </div>
  </div>

  <!-- Prize Name Animation -->
  <div
    v-if="isShowPrize && currentPrize"
    class="prize-name-container"
    :style="prizeNameStyle"
    :class="{ 'animate-pulse bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent': !isTextColor }"
  >
    {{ currentPrize.name }}
  </div>
</template>

<style scoped lang="scss">
.header-title {
    -webkit-animation: tracking-in-expand-fwd 0.8s cubic-bezier(0.215, 0.610, 0.355, 1.000) both;
    animation: tracking-in-expand-fwd 0.8s cubic-bezier(0.215, 0.610, 0.355, 1.000) both;
}

.prize-name-container {
    animation: slide-in-right 0.8s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
}

@keyframes slide-in-right {
  0% {
    transform: translate(100vw, -50%);
    opacity: 0;
  }
  100% {
    transform: translate(-50%, -50%);
    opacity: 1;
  }
}

@-webkit-keyframes tracking-in-expand-fwd {
    0% {
        letter-spacing: -0.5em;
        -webkit-transform: translateZ(-700px);
        transform: translateZ(-700px);
        opacity: 0;
    }

    40% {
        opacity: 0.6;
    }

    100% {
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        opacity: 1;
    }
}

@keyframes tracking-in-expand-fwd {
    0% {
        letter-spacing: -0.5em;
        -webkit-transform: translateZ(-700px);
        transform: translateZ(-700px);
        opacity: 0;
    }

    40% {
        opacity: 0.6;
    }

    100% {
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        opacity: 1;
    }
}
</style>
