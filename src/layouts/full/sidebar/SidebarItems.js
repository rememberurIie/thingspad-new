import React from "react";
import { useLocation, NavLink, Link } from 'react-router-dom';
import { Box, Typography } from "@mui/material";
import {
  Logo,
  Sidebar as MUI_Sidebar,
  Menu,
  MenuItem,
  Submenu,
} from "react-mui-sidebar";
import { IconPoint } from '@tabler/icons-react';
import Menuitems from "./MenuItems";
import logoicn from "../../../assets/images/logos/dark1-logo.svg";
import { Link as RouterLink } from 'react-router-dom';
import { Divider } from "@mui/material"; // เพิ่มไว้ด้านบน


const renderMenuItems = (items, pathDirect, isMinimized) => {
  return items.map((item) => {
    const Icon = item.icon ? item.icon : IconPoint;
    const itemIcon = <Icon stroke={1.5} size="1.3rem" />;

    if (item.subheader) {
      return (
        <Box sx={{ margin: "0 -24px", textTransform: 'uppercase' }} key={item.subheader}>
          {!isMinimized ? (
            <Menu subHeading={item.subheader} />
          ) : (
            <Divider sx={{ borderColor: "#ccc", mx: 4, my: 2 }} />
          )}
        </Box>
      );
    }

    // if (item.children) {
    //   return (
    //     <Submenu
    //       key={item.id}
    //       title={!isMinimized ? item.title : ''}
    //       icon={itemIcon}
    //       borderRadius='7px'
    //     >
    //       {renderMenuItems(item.children, pathDirect, isMinimized)}
    //     </Submenu>
    //   );
    // }

    return (
      <MenuItem
        key={item.id}
        isSelected={pathDirect === item?.href}
        borderRadius='7px'
        icon={itemIcon}
        component={RouterLink} // Use RouterLink for internal navigation
        link={item.href} // The library will handle wrapping the entire item with the link
        target={item.href && item.href.startsWith("https") ? "_blank" : "_self"}
        badge={item.chip ? true : false}
        badgeContent={item.chip || ""}
        badgeColor='secondary'
        badgeTextColor="#1b84ff"
        disabled={item.disabled}
      >
        {!isMinimized && item.title}
</MenuItem> 
    );
  });
};



const SidebarItems = ({ isMinimized }) => {
  const location = useLocation();
  const pathDirect = location.pathname;

  return (
    <Box sx={{ px: "24px", overflowX: 'hidden', py: { xs: '15px', lg: 0 } }}>
      <MUI_Sidebar
        width={isMinimized ? "45px" : "100%"}
        showProfile={false}
        themeColor={"#5D87FF"}
        themeSecondaryColor={'#49BEFF1a'}
      >
        <Box sx={{ margin: "0 -24px" }}>
          <Logo img={logoicn} component={NavLink} to="/" >
            {!isMinimized && "Flexy"}
          </Logo>
        </Box>
        {renderMenuItems(Menuitems, pathDirect, isMinimized)}
      </MUI_Sidebar>
    </Box>
  );
};

// return (
//     <Box sx={{ px: "24px", overflowX: 'hidden',py: {
//       xs: '15px',    // ขนาดเล็กกว่า lg จะได้ 24px
//       lg: 0          // ตั้งแต่ lg ขึ้นไปจะไม่มี paddingY
//     } }}>
//       <MUI_Sidebar 
//          width={"100%"} 
//          showProfile={false} 
//          themeColor={"#5D87FF"} 
//          themeSecondaryColor={'#49BEFF1a'}
//        >
//         <Box sx={{ margin: "0 -24px"}}>
//           <Logo img={logoicn} component={NavLink} to="/" >
//            Flexy</Logo>
//         </Box>
//         {renderMenuItems(Menuitems, pathDirect)}
//       </MUI_Sidebar>
//     </Box>
//   );
// };

export default SidebarItems;
