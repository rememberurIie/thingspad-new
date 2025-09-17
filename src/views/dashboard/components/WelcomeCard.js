import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';



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
      <Box sx={{ width: '100%' }}>
        <Box display="flex" flexDirection="row" alignItems="center">
          <Avatar
            src="https://scontent.fbkk22-8.fna.fbcdn.net/v/t39.30808-6/244255392_411819196968895_469472291332141984_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeGN98UTya7iaf5osv5ir3RnTq0bD5Dbgr9OrRsPkNuCv77tBmhrYbeTLKIeoVmfW6SEE2HAq3CR2EsCT8Q1HLjy&_nc_ohc=dxh95hbaDD0Q7kNvwGY6tlI&_nc_oc=AdlwqbCz_jSZaxuaD810mWNt6_QQOk4mVJdlTwUVyw1mcii-2wVh33xQEuieL1-9iPI&_nc_zt=23&_nc_ht=scontent.fbkk22-8.fna&_nc_gid=dRjYekkFmD0zeS7UjyUC-w&oh=00_AfZMwpMo-BuyTOMR0wpFNCcxNQF0tQaGkuFct7nJ_u_a4A&oe=68D0E745"
            sx={{
              width: 75,
              height: 75,
              mr: 2,
            }}
          >
          </Avatar>
          <Box gap={1} display="flex" flexDirection="column">
            <Typography sx={{ fontSize: '25px', fontWeight: 100 }}>
              Welcome Back!
            </Typography>
            <Typography sx={{ fontSize: '35px', fontWeight: 700 }}>
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