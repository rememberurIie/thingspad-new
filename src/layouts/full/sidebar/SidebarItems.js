import React, { useEffect, useState, useRef } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { Box, Divider, Button, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, ListItem as MuiListItem, ListItemAvatar, ListItemText, Avatar, List as MuiList, CircularProgress, TextField, Typography, IconButton } from "@mui/material";
import {
  Logo,
  Sidebar as MUI_Sidebar,
  Menu,
  MenuItem,
} from "react-mui-sidebar";
import { IconPoint } from "@tabler/icons-react";
import Menuitems from "./MenuItems";
import logoicn_dark from "../../../assets/images/logos/ThingsPad-small.svg";
import logoicn from "../../../assets/images/logos/ThingsPad-small-dark.svg";
import logoicn_small from "../../../assets/images/logos/ThingsPad-square-dark.svg";
import logoicn_small_dark from "../../../assets/images/logos/ThingsPad-square.svg";
import { Link as RouterLink } from "react-router-dom";
import { useSelector } from 'react-redux';
import { useTheme } from "@mui/material/styles";
import { useTranslation } from 'react-i18next';
import useSSE from "../../../hook/useSSE";
import { useProjectList } from '../../../contexts/ProjectListContext';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';


const renderMenuItems = (items, pathDirect, isMinimized) => {

  const { t } = useTranslation();

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
            <Menu subHeading={t(item.subheader)} /> // subheader multilanguage
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
        {!isMinimized && t(item.title)} {/*title multilanguage*/}
      </MenuItem>
    );
  });
};

const SidebarItems = ({ isMinimized }) => {
  const { projects, setProjects } = useProjectList();
  const location = useLocation();
  const pathDirect = location.pathname;
  const theme = useTheme();
  const user = useSelector(state => state.auth.user);
  const { t } = useTranslation();

  // --- Create Project Dialog State ---
  const [openCreate, setOpenCreate] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [projectName, setProjectName] = useState('');

  // Open dialog and load users
  const handleOpenCreate = async () => {
    setOpenCreate(true);
    setLoadingUsers(true);
    setCreateError('');
    try {
      // ไม่ต้องส่ง body หรือ header ใดๆ
      const res = await fetch('http://192.168.68.81:3000/api/group/getUserToCreateGroup', {
        method: 'POST',
      });
      const data = await res.json();
      // users อยู่ใน data.users
      setAllUsers((data.users || []).map(u => ({
        ...u,
        id: u.userId, // ให้ใช้ id สำหรับ checkbox/select
      })));
      // Preselect myself (ถ้ามี user?.uid ตรงกับ userId ใน list)
      if (user?.uid) setSelectedMembers([user.uid]);
    } catch {
      setAllUsers([]);
      setCreateError('Failed to load users');
    }
    setLoadingUsers(false);
  };

  const handleCloseCreate = () => {
    setOpenCreate(false);
    setProjectName('');
    setSelectedMembers(user?.uid ? [user.uid] : []);
    setCreateError('');
  };

  const handleToggleMember = (uid) => {
    setSelectedMembers(prev =>
      prev.includes(uid)
        ? prev.filter(id => id !== uid)
        : [...prev, uid]
    );
  };

  const handleCreateProject = async () => {
    if (!projectName.trim() || selectedMembers.length < 3) return;
    setCreateLoading(true);
    setCreateError('');
    try {
      const res = await fetch('http://192.168.68.81:3000/api/project/chat/createProject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName,
          members: selectedMembers,
        }),
      });
      const data = await res.json();
      // สำเร็จถ้า data.success === true
      if (data.success) {
        handleCloseCreate();
      } else {
        setCreateError(data.error || 'Create failed');
      }
    } catch {
      setCreateError('Create failed');
    }
    setCreateLoading(false);
  };

  // // Use SSE hook to fetch projects
  // useSSE(
  //   user ? "http://192.168.68.81:3000/api/project/chat/getProjectList" : null,
  //   (data) => {
  //     setProjects(prev => {
  //       if (JSON.stringify(prev) !== JSON.stringify(data)) {
  //         return data;
  //       }
  //       return prev;
  //     });
  //   },
  //   user ? { uid: user.uid } : undefined
  // );

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
    { subheader: t('menu.projects', 'Projects') },
    ...projectMenuItems,
  ];

  return (
    <>
      <Box sx={{ px: "24px", overflowX: "hidden", py: { xs: "15px", lg: 0 } }}>
        <MUI_Sidebar
          width={isMinimized ? "45px" : "100%"}
          showProfile={false}
          themeColor={"#5D87FF"}
          themeSecondaryColor={"#49BEFF1a"}
          textColor={theme.palette.grey[600]}
        >
          <Box sx={{ margin: "0 -19px" }}>
          <Logo
            img={
              isMinimized
                ? (theme.palette.mode === 'dark' ? logoicn_small_dark : logoicn_small)
                : (theme.palette.mode === 'light' ? logoicn : logoicn_dark)
            }
            component={NavLink}
            to="/"
            sx={{
              width: isMinimized ? 32 : 120,
              height: isMinimized ? 32 : 40,
              mx: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'width 0.2s, height 0.2s'
            }}
          >
            {!isMinimized && "Flexy"}
          </Logo>
        </Box>
          {renderMenuItems(combinedMenu, pathDirect, isMinimized)}
        </MUI_Sidebar>
      </Box>
      <Box
        sx={{
          mt: 1,
          display: 'flex',
          justifyContent: 'center',
          px: "24px",
          width: isMinimized ? '100%' : 'auto',
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenCreate}
          sx={{
            width: isMinimized ? 45 : '100%',
            minWidth: 45,
            height: 40,
            borderRadius: '7px',
            p: 0,
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: 'none',
            background: theme.palette.grey[800],
            color: theme.palette.grey[100],
            display: 'flex',
            gap: 1,
            '& .MuiButton-startIcon': {
              margin: 0,
              display: 'flex',
              alignItems: 'center',
            },
            '& span': {
              display: isMinimized ? 'none' : 'inline',
            },
          }}
          disabled={false}
          startIcon={<AddIcon />}
        >
          <span>{!isMinimized && t('menu.create_project', 'Create Project')}</span>
        </Button>
      </Box>
      {/* Create Project Dialog */}
      {openCreate && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            bgcolor: 'rgba(0,0,0,0.25)',
            zIndex: 1300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box
            sx={{
              width: 370,
              bgcolor: 'background.paper',
              borderRadius: 3,
              boxShadow: 24,
              p: 3,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography variant="subtitle2" mb={1} sx={{ fontSize: '24px', fontWeight: 'bold' }}>
              {t('menu.popup_create_project_header')}
            </Typography>
            <Typography variant="subtitle2" mb={2}>
              {t('menu.popup_create_project_description')}
            </Typography>
            <IconButton
              onClick={handleCloseCreate}
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <CloseIcon />
            </IconButton>
            <Box display="flex" alignItems="center" mb={2}>
              <TextField
                label={t('menu.popup_create_project_searchbox')}
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                fullWidth
                size="small"
              />
            </Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t('menu.popup_create_project_selectmember')}
            </Typography>
            {loadingUsers ? (
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <CircularProgress size={18} /> {t('Loading...')}
              </Box>
            ) : (
              <Box sx={{ maxHeight: 180, overflowY: 'auto', mb: 1 }}>
                {allUsers.map(u => (
                  <Box key={u.id || u.uid} display="flex" alignItems="center" mb={0.5}>
                    <Checkbox
                      checked={selectedMembers.includes(u.id || u.uid)}
                      onChange={() => handleToggleMember(u.id || u.uid)}
                      disabled={u.id === user?.uid || u.uid === user?.uid}
                      size="small"
                    />
                    <Avatar src={u.avatarUrl} sx={{ width: 28, height: 28, fontSize: 12, mr: 1 }}>
                      {(u.fullName || u.username || '??').slice(0, 2).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2">{u.fullName || u.username || u.id || u.uid}</Typography>
                  </Box>
                ))}
              </Box>
            )}
            {createError && <Typography color="error" variant="body2" mb={1}>{createError}</Typography>}
            <Button
              variant="contained"
              color="primary"
              startIcon={<CheckIcon />}
              onClick={handleCreateProject}
              disabled={createLoading || !projectName.trim() || selectedMembers.length < 3}
              fullWidth
              sx={{ mt: 1 }}
            >
              {createLoading ? t('menu.popup_create_project_creating') : t('menu.popup_create_project_create')}
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
};

export default SidebarItems;
