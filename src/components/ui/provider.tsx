'use client'

import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
} from '@chakra-ui/react'
import { ColorModeProvider, type ColorModeProviderProps } from './color-mode'
import { AlertDialogProvider } from './alert-dialog'
import { fullcourtHex, fullcourtPalette } from '@/theme/fullcourt.colors'

export function Provider(props: ColorModeProviderProps) {
  const config = defineConfig({
    globalCss: {
      body: { colorPalette: 'blue', color: 'fullcourt.text' },
      '*': {
        touchAction: 'manipulation',
      },
    },
    theme: {
      tokens: {
        colors: {
          blue: fullcourtPalette,
          teal: fullcourtPalette,
          fullcourt: {
            gold: { value: fullcourtHex.gold },
            ivory: { value: fullcourtHex.ivory },
            pageBg: { value: fullcourtHex.pageBg },
            sectionBg: { value: fullcourtHex.sectionBg },
            cardBg: { value: fullcourtHex.cardBg },
            border: { value: fullcourtHex.border },
            text: { value: fullcourtHex.text },
            textSoft: { value: fullcourtHex.textSoft },
            textMuted: { value: fullcourtHex.textMuted },
            accentBg: { value: fullcourtHex.accentBg },
            accentText: { value: fullcourtHex.accentText },
            pointBlue: { value: fullcourtHex.pointBlue },
            pointGreen: { value: fullcourtHex.pointGreen },
            pointGreenSoft: { value: fullcourtHex.pointGreenSoft },
            pointAmber: { value: fullcourtHex.pointAmber },
            pointAmberSoft: { value: fullcourtHex.pointAmberSoft },
            buttonPrimaryBg: { value: fullcourtHex.buttonPrimaryBg },
            buttonPrimaryHover: { value: fullcourtHex.buttonPrimaryHover },
            buttonPrimaryText: { value: fullcourtHex.buttonPrimaryText },
            buttonOutlineBorder: { value: fullcourtHex.buttonOutlineBorder },
            buttonOutlineHover: { value: fullcourtHex.buttonOutlineHover },
            footerBg: { value: fullcourtHex.footerBg },
          },
        },
      },
      semanticTokens: {
        colors: {
          bg: {
            DEFAULT: { value: '{colors.fullcourt.cardBg}' },
            panel: { value: '{colors.fullcourt.cardBg}' },
            subtle: { value: '{colors.fullcourt.pageBg}' },
            muted: { value: '{colors.fullcourt.sectionBg}' },
          },
          fg: {
            DEFAULT: { value: '{colors.fullcourt.text}' },
            muted: { value: '{colors.fullcourt.textSoft}' },
            subtle: { value: '{colors.fullcourt.textMuted}' },
          },
          border: { DEFAULT: { value: '{colors.fullcourt.border}' } },
        },
      },
      slotRecipes: {
        card: {
          slots: ['root', 'header', 'body', 'footer', 'title', 'description'],
          base: {
            root: {
              borderColor: 'fullcourt.border',
              bg: 'fullcourt.cardBg',
              boxShadow: '0 2px 8px rgba(25, 52, 73, 0.04)',
            },
          },
        },
      },
      recipes: {
        button: {
          base: { borderRadius: 'md' },
          defaultVariants: { colorPalette: 'blue' },
        },
        textarea: {
          defaultVariants: {
            size: 'lg',
          },
        },
        input: {
          defaultVariants: {
            size: 'lg',
          },
        },
      },
    },
  })
  const system = createSystem(defaultConfig, config)

  return (
    <ChakraProvider value={system}>
      <ColorModeProvider {...props} forcedTheme="light" enableSystem={false}>
        <AlertDialogProvider>{props.children}</AlertDialogProvider>
      </ColorModeProvider>
    </ChakraProvider>
  )
}
