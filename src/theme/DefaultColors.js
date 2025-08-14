import { createTheme } from "@mui/material/styles";
import typography from "./Typography";
import { shadows } from "./Shadows";

const baselightTheme = createTheme({
  direction: 'ltr',
  palette: {
    mode: 'light',
    primary: {
      main: '#5D87FF',
      light: '#ECF2FF',
      dark: '#4570EA',
      contrastText: '#ffffff',
      transparent: "#ffffff00"
    },
    secondary: {
      main: '#49BEFF',
      light: '#E8F7FF',
      dark: '#23afdb',
      contrastText: '#ffffff',
    },
    success: {
      main: '#13DEB9',
      light: '#E6FFFA',
      dark: '#02b3a9',
      contrastText: '#ffffff',
    },
    info: {
      main: '#539BFF',
      light: '#EBF3FE',
      dark: '#1682d4',
      contrastText: '#ffffff',
    },
    error: {
      main: '#FA896B',
      light: '#FDEDE8',
      dark: '#f3704d',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#FFAE1F',
      light: '#FEF5E5',
      dark: '#ae8e59',
      contrastText: '#ffffff',
    },
    purple: {
      A50: '#EBF3FE',
      A100: '#6610f2',
      A200: '#557fb9',
    },
    grey: {
      100: '#F9F9F9',  // Lighter, neutral grey
      200: '#E5E5E5',  // Neutral grey
      300: '#D1D1D1',  // Neutral grey
      400: '#A0A0A0',  // Neutral grey
      500: '#7A7A7A',  // Neutral grey
      600: '#555555',  // Darker neutral grey
      700: '#333333',  // Darker neutral grey
      800: '#222222',  // Very dark neutral grey
    },
    text: {
      primary: '#2A3547',
      secondary: '#5A6A85',
    },
    action: {
      disabledBackground: 'rgba(73,82,88,0.12)',
      hoverOpacity: 0.02,
      hover: '#f6f9fc',
    },
    divider: '#e5eaef',
  },
  typography,
  shadows,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        a: {
          textDecoration: "none",
        },
        '.simplebar-scrollbar:before': {
          background: " #DFE5EF!important"
        },
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "7px",
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none'
          }
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 9px 17.5px rgb(0,0,0,0.05)'
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none'
          }
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e5eaef !important',
          },
          borderRadius: "7px",
          '&.Mui-focused .MuiOutlinedInput-notchedOutline, &:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#5D87FF !important'
          }
        },
      },
    },
  }
});

const basedarkTheme = createTheme({
  direction: 'ltr',
  palette: {
    mode: 'dark',
    primary: {
      main: '#5D87FF',
      light: '#4570EA',
      dark: '#2f4ab8',
      contrastText: '#ffffff',
      transparent: "#00000000"
    },
    secondary: {
      main: '#49BEFF',
      light: '#1682d4',
      dark: '#0e5a91',
      contrastText: '#ffffff',
    },
    success: {
      main: '#13DEB9',
      light: '#02b3a9',
      dark: '#01786f',
      contrastText: '#ffffff',
    },
    info: {
      main: '#539BFF',
      light: '#1682d4',
      dark: '#0b4d87',
      contrastText: '#ffffff',
    },
    error: {
      main: '#FA896B',
      light: '#f3704d',
      dark: '#a74428',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#FFAE1F',
      light: '#d9901a',
      dark: '#8a5d10',
      contrastText: '#ffffff',
    },
    purple: {
      A50: '#2A2E3B',
      A100: '#6610f2',
      A200: '#7a6ee6',
    },
    grey: {
      100: '#222222',  // Neutral dark grey
      200: '#2A2A2A',  // Darker neutral grey
      300: '#333333',  // Dark neutral grey
      400: '#909090ff',
      500: '#c5c5c5ff',
      600: '#EAEFF4',
      700: '#F2F6FA',
      800: '#000000',  // Very dark grey
    },
    background: {
      default: '#1E1E1E',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#ffffff',
      secondary: '#A4B0C3',
    },
    action: {
      disabledBackground: 'rgba(255,255,255,0.12)',
      hoverOpacity: 0.04,
      hover: '#2A2E3B',
    },
    divider: '#2E3440',
  },
  typography,
  shadows,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        a: {
          textDecoration: "none",
        },
        '.simplebar-scrollbar:before': {
          background: " #444!important"
        },
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "7px",
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none'
          }
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 9px 17.5px rgb(0,0,0,0.2)'
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none'
          }
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#2E3440 !important',
          },
          borderRadius: "7px",
          '&.Mui-focused .MuiOutlinedInput-notchedOutline, &:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#5D87FF !important'
          }
        },
      },
    },
  }
});

export { baselightTheme, basedarkTheme };


