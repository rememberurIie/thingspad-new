import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import { useTheme } from "@mui/material/styles";
import { useTranslation } from 'react-i18next';

const WelcomeCard = ({ fullName, userId }) => {

  console.log(fullName, userId);

  const theme = useTheme();
  const { t } = useTranslation();

   return (

  <Card
    variant="outlined"
    sx={{ borderRadius: '10px', position: 'relative' }} //
  >
    <CardContent
      sx={{
        my: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'start',
        "&:last-child": { pb: 2 }
      }}
    >
      <Box sx={{ width: '100%' }}>
        <Box display="flex" flexDirection="row" alignItems="center">
          <Avatar
            src={`https://storage.googleapis.com/thing-702bc.appspot.com/avatars/${userId}/avatar.jpg`}
            sx={{
              width: 75,
              height: 75,
              mr: 2,
            }}
          >
            <Typography color={theme.palette.grey[100]}>
              {fullName ? fullName.slice(0, 2).toUpperCase() : ''}
            </Typography>
          </Avatar>
          <Box gap={1} display="flex" flexDirection="column">
            <Typography
              sx={{
                fontSize: { xs: '18px', sm: '22px', md: '25px', lg: '25px' },
                fontWeight: 100
              }}
            >
              {t('dashboard.welcome')}
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '24px', sm: '30px', md: '35px', lg: '35px' },
                fontWeight: 700
              }}
            >
              {fullName}
            </Typography>
          </Box>
        </Box>
      </Box>
    </CardContent>
    {/* รูปภาพที่มุมขวาล่าง */}
    <Box
      sx={{
        position: 'absolute',
        right: { xs: 10, sm: 20, md: 30 },
        bottom: { xs: '-8px', sm: '-12px', md: '-15px' },
        width: { xs: 80, sm: 110, md: 140, lg: 150 }, // responsive width
        height: 'auto',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    >
      <img
        src="src\assets\images\WelcomeCard.png"
        alt="flowers"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </Box>
  </Card>
   )
};

export default WelcomeCard;