import { createTheme } from '@mui/material/styles';

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
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      '"Noto Sans"',
      '"Noto Sans JP"',  // 添加日文字体支持
      'sans-serif',
    ].join(','),
  },
  components: {
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