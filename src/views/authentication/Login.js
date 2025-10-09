import React, { useState, useContext } from 'react';
import { Grid, Box, Card, Stack, Typography, IconButton, Tooltip, Button, Alert } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useTheme } from "@mui/material/styles";
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';

//logo
import logoicn_dark from "../../assets/images/logos/ThingsPad-small.svg";
import logoicn from "../../assets/images/logos/ThingsPad-small-dark.svg";

// components
import PageContainer from 'src/components/container/PageContainer';
import Logo from 'src/layouts/full/shared/logo/Logo';
import CustomTextField from '../../components/forms/theme-elements/CustomTextField';
import { loginSuccess } from '../../session/authSlice';
import { ColorModeContext } from 'src/theme/ColorModeContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitch from '../../language/LanguageSwitch';

const AuthLogin = ({ title, subtitle, subtext, error: errorProp, loading: loadingProp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://192.168.1.36:3000/api/account/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error('Invalid email or password');
      }

      const userInfo = await res.json();
      dispatch(loginSuccess(userInfo));
      sessionStorage.setItem('user', JSON.stringify(userInfo));
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError("login.invalid_user");
    } finally {
      setLoading(false);
    }
  };

  // ใช้ค่าจาก props ถ้ามี
  const showError = errorProp !== undefined ? errorProp : error;
  const showLoading = loadingProp !== undefined ? loadingProp : loading;

  return (
    <>
      {title && (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      )}

      {subtext}

      {showError && (
        <Alert severity="error" sx={{ my: 2, '& .MuiAlert-message': { pt: 1.2 }}}>
          {showError === true ? t('login.invalid_user') : showError}
        </Alert>
      )}

      <form onSubmit={handleLogin}>
        <Stack>
          <Box>
            <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="email" mb="5px">
              {t('login.email')}
            </Typography>
            <CustomTextField
              id="email"
              type="email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={(theme) => {
                const bg = theme.palette.grey[100];
                const fg = theme.palette.text.primary;
                return {
                  '& .MuiOutlinedInput-root': { backgroundColor: 'transparent' },
                  '& input': { WebkitTextFillColor: 'inherit', color: 'inherit', caretColor: fg },
                  '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus': {
                    WebkitBoxShadow: `0 0 0 1000px ${bg} inset`,
                    boxShadow: `0 0 0 1000px ${bg} inset`,
                    WebkitTextFillColor: fg,
                    caretColor: fg,
                    transition: 'background-color 9999s ease-out 0s',
                  },
                  '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                };
              }}
            />
          </Box>

          <Box mt="25px">
            <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="password" mb="5px">
              {t('login.password')}
            </Typography>
            <CustomTextField
              id="password"
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Box>

          <Stack justifyContent="space-between" direction="row" alignItems="center" my={2}>
            <Typography
              component={Link}
              to="/forgot-password"
              fontWeight="500"
              sx={{
                textDecoration: 'none',
                color: 'primary.main',
              }}
            >
              {t('login.forgot_pass')}
            </Typography>
          </Stack>
        </Stack>

        <Box>
          <Button
            color="primary"
            variant="contained"
            size="large"
            fullWidth
            type="submit"
            disabled={showLoading}
          >
            {showLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Box>
      </form>

      {subtitle}
    </>
  );
};

const Login2 = (props) => {
  const theme = useTheme();
  const { isDarkMode, toggle } = useContext(ColorModeContext);
  const { t } = useTranslation();

  return (
    <PageContainer title="Login" description={t('login.description')}>
      <Box
        sx={{
          position: 'relative',
          '&:before': {
            content: '""',
            background: theme.palette.grey[500],
            backgroundSize: '400% 400%',
            animation: 'gradient 15s ease infinite',
            position: 'absolute',
            height: '100%',
            width: '100%',
            opacity: '0.3',
          },
        }}
      >
        <Grid container spacing={0} justifyContent="center" sx={{ height: '100vh' }}>
          <Grid
            display="flex"
            justifyContent="center"
            alignItems="center"
            size={{ xs: 12, sm: 12, lg: 4, xl: 3 }}
          >
            <Card
              elevation={9}
              sx={{
                p: 4,
                zIndex: 1,
                width: '100%',
                maxWidth: '500px',
                position: 'relative',
                background: theme.palette.background.paper,
              }}
            >
              <Tooltip>
                <LanguageSwitch sx={{ position: 'absolute', top: 8, right: 8 }} />
                <IconButton
                  aria-label="toggle color mode"
                  onClick={toggle}
                  sx={{ position: 'absolute', top: 8, left: 8 }}
                >
                  {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>

              <Box display="flex" alignItems="center" justifyContent="center" mt={4}>
                <img
                  src={theme.palette.mode === 'dark' ? logoicn_dark : logoicn}
                  alt="Logo"
                  style={{
                    width: 'auto',
                    height: '50',
                    objectFit: 'contain'
                  }}
                />
              </Box>

              <AuthLogin
                {...props} // ส่ง props จาก Storybook มาที่ AuthLogin
                subtext={
                  <Typography variant="subtitle1" textAlign="center" my={2}>
                    {t('login.description')}
                  </Typography>
                }
                subtitle={
                  <Stack direction="row" spacing={1} justifyContent="center" mt={3}>
                    <Typography color="textSecondary" variant="h6" fontWeight="500">
                      {t('login.register_ask')}
                    </Typography>
                    <Typography
                      component={Link}
                      to="/auth/register"
                      fontWeight="500"
                      sx={{ textDecoration: 'none', color: 'primary.main' }}
                    >
                      {t('login.register')}
                    </Typography>
                  </Stack>
                }
              />
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Login2;
