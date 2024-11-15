import { createTheme } from '@mui/material/styles';
import { zhCN } from '@mui/material/locale';

export default createTheme(
  {
    palette: {
      primary: {
        main: '#4285F4',
      },
      secondary: {
        main: '#34A853',
      },
      error: {
        main: '#EA4335',
      },
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'PingFang SC',
        'Microsoft YaHei',
        'Helvetica Neue',
        'Noto Sans SC',
        'sans-serif'
      ].join(','),
    },
  },
  zhCN
); 