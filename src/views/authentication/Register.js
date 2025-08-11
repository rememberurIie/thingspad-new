import React, { useContext } from 'react';
import { Grid, Box, Card, Typography, Stack, IconButton, Tooltip } from '@mui/material';
import { Link } from 'react-router';
import PageContainer from 'src/components/container/PageContainer';
import Logo from 'src/layouts/full/shared/logo/Logo';
import AuthRegister from './auth/AuthRegister';
import { useTheme } from "@mui/material/styles";

import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { ColorModeContext } from 'src/theme/ColorModeContext';

const Register2 = () => {
  const theme = useTheme();
  const { isDarkMode, toggle } = useContext(ColorModeContext);

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
                // ใช้ background.paper เพื่อรองรับทั้ง Light/Dark
                background: theme.palette.background.paper,
              }}
            >
              {/* ปุ่ม Toggle มุมขวาบนของ Card */}
              <Tooltip title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} mode`}>
                <IconButton
                  aria-label="toggle color mode"
                  onClick={toggle}
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                  {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>

              <Box display="flex" alignItems="center" justifyContent="center" mt={1}>
                <Logo />
              </Box>

              <AuthRegister
                subtext={
                  <Typography variant="subtitle1" textAlign="center" mb={1}>
                    Create your account
                  </Typography>
                }
                subtitle={
                  <Stack direction="row" justifyContent="center" spacing={1} mt={3}>
                    <Typography color="textSecondary" variant="h6" fontWeight="400">
                      Already have an Account?
                    </Typography>
                    <Typography
                      component={Link}
                      to="/auth/login"
                      fontWeight="500"
                      sx={{ textDecoration: 'none', color: 'primary.main' }}
                    >
                      Sign In
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
