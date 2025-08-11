import React, { useContext } from 'react';
import { Link } from 'react-router';
import { Grid, Box, Card, Stack, Typography, IconButton, Tooltip } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

import { useTheme } from "@mui/material/styles";

// components
import PageContainer from 'src/components/container/PageContainer';
import Logo from 'src/layouts/full/shared/logo/Logo';
import AuthLogin from './auth/AuthLogin';

// ⬇️ ใช้ Context สำหรับ toggle
import { ColorModeContext } from 'src/theme/ColorModeContext';

import { useTranslation } from 'react-i18next';
import LanguageSwitch from '../../language/LanguageSwitch';

const Login2 = () => {
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
                // แนะนำให้ใช้ background.paper เพื่อเข้ากับโหมดมืด/สว่างอัตโนมัติ
                background: theme.palette.background.paper,
              }}
            >


              {/* ปุ่ม Toggle มุมขวาบนของ Card */}
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

              <Box display="flex" alignItems="center" justifyContent="center" mt={1}>
                <Logo />
              </Box>

              <AuthLogin
                subtext={
                  <Typography variant="subtitle1" textAlign="center" mb={1}>
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
