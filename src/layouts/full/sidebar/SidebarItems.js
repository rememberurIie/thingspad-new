import React, { useEffect, useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { Box, Divider } from "@mui/material";
import {
  Logo,
  Sidebar as MUI_Sidebar,
  Menu,
  MenuItem,
} from "react-mui-sidebar";
import { IconPoint } from "@tabler/icons-react";
import Menuitems from "./MenuItems";
import logoicn from "../../../assets/images/logos/dark1-logo.svg";
import { Link as RouterLink } from "react-router-dom";

const renderMenuItems = (items, pathDirect, isMinimized) => {
  return items.map((item) => {
    const Icon = item.icon ? item.icon : IconPoint;
    const itemIcon = <Icon stroke={1.5} size="1.3rem" />;

    if (item.subheader) {
      return (
        <Box
          sx={{ margin: "0 -24px", textTransform: "uppercase" }}
          key={item.subheader}
        >
          {!isMinimized ? (
            <Menu subHeading={item.subheader} />
          ) : (
            <Divider sx={{ borderColor: "#ccc", mx: 4, my: 2 }} />
          )}
        </Box>
      );
    }

    return (
      <MenuItem
        key={item.id}
        isSelected={pathDirect === item?.href}
        borderRadius="7px"
        icon={itemIcon}
        component={RouterLink}
        link={item.href}
        target={item.href && item.href.startsWith("https") ? "_blank" : "_self"}
        badge={item.chip ? true : false}
        badgeContent={item.chip || ""}
        badgeColor="secondary"
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

  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchSSE = async () => {
      try {
        const response = await fetch(
          "http://192.168.1.32:3000/api/project/getProjectList",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ uid: "Smxw91lXjdgMOgyo0p3cuyWjFKK2" }),
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // แบ่งข้อมูล stream เป็น block ตาม \n\n ของ SSE
          let parts = buffer.split("\n\n");

          for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (part.startsWith("data: ")) {
              const jsonStr = part.replace("data: ", "").trim();
              try {
                const parsedData = JSON.parse(jsonStr);
                setProjects(parsedData);
              } catch (err) {
                console.error("JSON parse error:", err);
              }
            }
          }

          buffer = parts[parts.length - 1]; // เก็บเศษที่ยังไม่สมบูรณ์ไว้
        }
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Fetch aborted");
        } else {
          console.error("Fetch error:", error);
        }
      }
    };

    fetchSSE();

    return () => {
      controller.abort();
    };
  }, []);

  // สร้างเมนูโปรเจกต์จากข้อมูล projects state
  const projectMenuItems = projects.map((project) => ({
    id: project.id,
    title: project.name,
    icon: IconPoint,
    href: `/project/${project.id}`,
  }));

  // รวมเมนูหลักและเมนูโปรเจกต์
  const combinedMenu = [
    ...Menuitems,
    { subheader: "Projects" },
    ...projectMenuItems,
  ];

  return (
    <Box sx={{ px: "24px", overflowX: "hidden", py: { xs: "15px", lg: 0 } }}>
      <MUI_Sidebar
        width={isMinimized ? "45px" : "100%"}
        showProfile={false}
        themeColor={"#5D87FF"}
        themeSecondaryColor={"#49BEFF1a"}
      >
        <Box sx={{ margin: "0 -24px" }}>
          <Logo img={logoicn} component={NavLink} to="/">
            {!isMinimized && "Flexy"}
          </Logo>
        </Box>
        {renderMenuItems(combinedMenu, pathDirect, isMinimized)}
      </MUI_Sidebar>
    </Box>
  );
};

export default SidebarItems;
