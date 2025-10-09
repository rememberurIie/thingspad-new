import React, { useState, useContext } from 'react';
import { Grid, Box, Card, Typography, Stack, IconButton, Tooltip, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import PageContainer from 'src/components/container/PageContainer';
import Logo from 'src/layouts/full/shared/logo/Logo';
import { useTheme } from "@mui/material/styles";

//logo
//logo
import logoicn_dark from "../../assets/images/logos/ThingsPad-small.svg";
import logoicn from "../../assets/images/logos/ThingsPad-small-dark.svg";

import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { ColorModeContext } from 'src/theme/ColorModeContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitch from '../../language/LanguageSwitch';
import CustomTextField from '../../components/forms/theme-elements/CustomTextField';

const AuthRegister = ({ title, subtitle, subtext, loading: loadingProp, error: errorProp }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ใช้ค่าจาก props ถ้ามี
  const showLoading = typeof loadingProp !== 'undefined' ? loadingProp : loading;
  // ถ้า errorProp เป็น true ให้แสดงข้อความ error จากระบบ
  const showError = errorProp === true ? t('register.error_signup') : error;

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://192.168.68.79:3000/api/account/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: name,
          username,
          email,
          password,
          role: 'unverified',
        }),
      });
      const data = await res.json();
      alert(t('register.success'));
      navigate('/auth/login');
    } catch (err) {
      setError(err.message || 'Register failed');
    }
    setLoading(false);
  };

  return (
    <>
      {title && (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      )}
      {subtext}
      <Box component="form" onSubmit={handleRegister}>
        <Stack mb={3}>
          <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor='name' mb="5px">{t('register.name')}</Typography>
          <CustomTextField
            id="name"
            variant="outlined"
            fullWidth
            value={name}
            onChange={e => setName(e.target.value)}
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
          <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor='email' mb="5px" mt="25px">{t('register.email')}</Typography>
          <CustomTextField
            id="email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={e => setEmail(e.target.value)}
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
          <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor='username' mb="5px" mt="25px">{t('register.username')}</Typography>
          <CustomTextField
            id="username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={e => setUsername(e.target.value)}
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
          <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor='password' mb="5px" mt="25px">{t('register.password')}</Typography>
          <CustomTextField
            id="password"
            variant="outlined"
            fullWidth
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </Stack>
        {showError && <Typography color="error" mb={2}>{showError}</Typography>}
        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          type="submit"
          disabled={showLoading}
        >
          {showLoading ? t('register.signup_button_loading') || 'Loading...' : t('register.signup_button')}
        </Button>
      </Box>
      {subtitle}
    </>
  );
};

const Register2 = (props) => {
  const theme = useTheme();
  const { isDarkMode, toggle } = useContext(ColorModeContext);
  const { t } = useTranslation();

  return (
    <PageContainer title="Register" description="this is Register page">
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
          <Grid display="flex" justifyContent="center" alignItems="center" size={{ xs: 12, sm: 12, lg: 4, xl: 3 }}>
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
              <Tooltip title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} mode`}>
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

              <AuthRegister
                {...props} // เพิ่มตรงนี้ เพื่อรับ props จาก Storybook
                subtext={
                  <Typography variant="subtitle1" textAlign="center" my={2}>
                    {t('register.description')}
                  </Typography>
                }
                subtitle={
                  <Stack direction="row" justifyContent="center" spacing={1} mt={3}>
                    <Typography color="textSecondary" variant="h6" fontWeight="400">
                      {t('register.have_account_ask')}
                    </Typography>
                    <Typography
                      component={Link}
                      to="/auth/login"
                      fontWeight="500"
                      sx={{ textDecoration: 'none', color: 'primary.main' }}
                    >
                      {t('register.signin_link')}
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

export default Register2;
