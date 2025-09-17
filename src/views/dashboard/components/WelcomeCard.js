import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';



const WelcomeCard = ({ fullName }) => {

   return (

  <Card
    variant="outlined"
    sx={{ borderRadius: '10px', position: 'relative' }} //
  >
    <CardContent
      sx={{
        my: 2,

        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'start',
        "&:last-child": { pb: 2 }
      }}
    >
      <Typography sx={{ mr: 2, my: 1, fontSize: '25px', fontWeight: 100 }}>
        Welcome Back!
      </Typography>
      <Typography sx={{ mr: 2, my: 1, fontSize: '35px', fontWeight: 700 }}>
        {fullName}
      </Typography>
    </CardContent>
    {/* รูปภาพที่มุมขวาล่าง */}
    <Box
      sx={{
        position: 'absolute',
        right: 30,
        bottom: '-15px',         // ขยับให้ชิดขอบล่าง
        width: 150,
        height: 'auto',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    >
      <img
        src="https://img2.pic.in.th/pic/cartoon-flowers-on-green-grass-with-white-background-flat-colorful-design-free-vector-removebg-preview.png"
        alt="flowers"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </Box>
  </Card>
   )
};

export default WelcomeCard;