import { createTheme } from '@mui/material/styles';

// 定义基础字体堆栈
const baseFont = [
  // 日语无衬线字体
  '"Noto Sans JP"',          // Google Noto字体
  '"Hiragino Sans"',         // macOS/iOS
  '"Hiragino Kaku Gothic ProN"', // macOS/iOS 老版本
  '"Yu Gothic"',             // Windows
  '"Meiryo"',               // Windows 备选
  'sans-serif'              // 后备字体
].join(',');

const minchoFont = [
  '"Hiragino Mincho ProN"',    // macOS/iOS 的ヒラギノ明朝
  '"Hiragino Mincho Pro"',     // 旧版 macOS
  '"Yu Mincho"',               // Windows
  '"YuMincho"',                // Windows 变体
  '"MS PMincho"',              // Windows 备选
  '"Noto Serif JP"',           // Web 字体备选
  'serif'                      // 后备衬线字体
].join(',');

const roundedFont = [
  '"M PLUS Rounded 1c"',    // Google Fonts
  '"Hiragino Maru Gothic ProN"', // macOS/iOS
  '"Rounded M+ 1c"',        // 备选圆体
  'sans-serif'              // 后备字体
].join(',');

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',  // 蓝色
      light: '#64b5f6',
      dark: '#1976d2',
    },
    error: {
      main: '#f44336',  // 红色
      light: '#e57373',
      dark: '#d32f2f',
    },
    success: {
      main: '#4caf50',  // 绿色
      light: '#81c784',
      dark: '#388e3c',
    },
    warning: {
      main: '#ff9800',  // 橙色
      light: '#ffb74d',
      dark: '#f57c00',
    },
  },
  typography: {
    fontFamily: baseFont,
    // 为每个变体单独设置字体
    allVariants: {
      fontFamily: baseFont,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          fontFamily: baseFont,
        },
        body: {
          fontFamily: baseFont,
          backgroundColor: '#F8F9FA',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',  // 防止按钮文字全大写
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,  // 更圆润的边角
        },
      },
    },
  },
});

export default theme;
export { minchoFont, baseFont, roundedFont };  // 导出字体变量 