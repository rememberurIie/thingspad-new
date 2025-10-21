import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Box, Typography, TextField, Button, Avatar, IconButton, Stack } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import Cropper from 'react-easy-crop';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';


const ProfileSettingDialog = ({
  open,
  onClose,
  profile,
  onSave,
}) => {
  const { t } = useTranslation();
  const user = useSelector(state => state.auth.user);
const userId = user?.uid;

// กำหนด default avatar จาก storage
const defaultAvatar = userId
  ? `https://storage.googleapis.com/thing-702bc.appspot.com/avatars/${userId}/avatar.jpg?${Date.now()}`
  : '';

  const [fullName, setFullName] = useState(profile.fullName || '');
  const [username, setUsername] = useState(profile.username || '');
  const [image, setImage] = useState(profile.avatar || defaultAvatar);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropping, setCropping] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef();

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(URL.createObjectURL(e.target.files[0]));
      setCropping(true);
    }
  };

  const handleCropComplete = (_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // ฟังก์ชันตัดภาพตาม crop
  async function getCroppedImg(imageSrc, cropPixels, maxSize = 256) {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        // resize canvas ให้ไม่เกิน maxSize
        const scale = Math.min(maxSize / cropPixels.width, maxSize / cropPixels.height, 1);
        canvas.width = cropPixels.width * scale;
        canvas.height = cropPixels.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(
          img,
          cropPixels.x, cropPixels.y, cropPixels.width, cropPixels.height,
          0, 0, canvas.width, canvas.height
        );
        canvas.toBlob((blob) => {
          resolve(blob);
        }, "image/jpeg", 0.8);
      };
      img.src = imageSrc;
    });
  }

  const handleCropSave = async () => {
    if (croppedAreaPixels && image) {
      // สร้าง blob จาก crop
      const croppedBlob = await getCroppedImg(image, croppedAreaPixels, 256);
      setImage(URL.createObjectURL(croppedBlob)); // ใช้ blob ที่ crop แล้ว
    }
    setCropping(false);
  };

  const handleDeleteImage = () => {
    // ถ้าเป็น default avatar หรือรูปที่แสดงอยู่ ให้ลบจริง
    if (image === defaultAvatar || image === profile.avatar) {
      setImage(null);
    } else {
      setImage(null);
    }
    setCropping(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ฟังก์ชัน resize รูปภาพ
  async function resizeImage(file, maxSize = 256) {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', 0.8); // คุณภาพ 80%
      };
      img.src = URL.createObjectURL(file);
    });
  }

  // ฟังก์ชันแปลงไฟล์ภาพเป็น JPEG เสมอ
  async function convertToJpeg(fileOrBlob, maxSize = 256) {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', 0.8); // always JPEG
      };
      img.src = URL.createObjectURL(fileOrBlob);
    });
  }

  const handleSave = async ({ fullName, username, image }) => {
    setSaving(true);
    const userId = user.uid;

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("fullName", fullName);
    formData.append("username", username);

    if (image && image.startsWith("blob:")) {
      const response = await fetch(image);
      const blob = await response.blob();
      const jpegBlob = await convertToJpeg(blob, 256);
      formData.append("avatar", jpegBlob, "avatar.jpg");
    } else if (image === null) {
      // กรณีลบรูป ให้ส่ง avatar เป็น null
      formData.append("avatar", "");
    }

    const res = await fetch("http://192.168.1.36:3000/api/account/updateProfile", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    setSaving(false);
    if (result.success) {
      onClose();
      window.location.reload();
    } else {
      // แจ้งเตือน error
    }
  };

  if (!open) return null;

  const dialog = (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        bgcolor: 'rgba(0,0,0,0.25)',
        zIndex: 3000,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <Box
        sx={{
          width: 350,
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: 24,
          p: 3,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <Typography variant="h6" mb={2}>{t('profile.setting')}</Typography>
        <Stack alignItems="center" mb={2}>
          <Avatar src={image === null ? undefined : (image || defaultAvatar)} sx={{ width: 90, height: 90, mb: 1 }} />
          <Stack direction="row" spacing={1}>
            <IconButton color="primary" component="label">
              <PhotoCamera />
              <input hidden accept="image/*" type="file" ref={fileInputRef} onChange={handleImageChange} />
            </IconButton>
            {image && (
              <IconButton color="error" onClick={handleDeleteImage}>
                <DeleteIcon />
              </IconButton>
            )}
          </Stack>
        </Stack>
        {cropping && (
          <Box sx={{ position: 'relative', width: 250, height: 250, mb: 2 }}>
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
            <Button variant="contained" size="small" sx={{ mt: 1 }} onClick={handleCropSave}>
              {t('profile.crop')}
            </Button>
          </Box>
        )}
        <TextField
          label={t('user.full_name')}
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label={t('user.username')}
          value={username}
          onChange={e => setUsername(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button onClick={onClose} disabled={saving}>{t('common.cancel')}</Button>
          <Button
            variant="contained"
            onClick={() => handleSave({ fullName, username, image })}
            disabled={saving}
            sx={{ bgcolor: saving ? 'grey.400' : undefined }}
          >
            {saving ? t('common.saving') : t('common.save')}
          </Button>
        </Stack>
      </Box>
    </Box>
  );

  return ReactDOM.createPortal(dialog, document.body);
};

export default ProfileSettingDialog;