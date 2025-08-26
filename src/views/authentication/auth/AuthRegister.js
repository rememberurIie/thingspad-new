import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router';

import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import { Stack } from '@mui/system';

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom';;

const AuthRegister = ({ title, subtitle, subtext }) => {

  const navigate = useNavigate();
  const { t } = useTranslation();

  // 1. State for form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 2. Submit handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('http://192.168.1.34:3000/api/account/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: name,
          username,
          email,
          password,
          role: 'unverified', // or any default role
        }),
      });
      const data = await res.json();
      
      alert(t('register.success')); // Show success message
      navigate('/auth/login'); // Redirect to login or another page
       
      
    } catch (err) {
      setError(err.message || 'Register failed');
    }
    setLoading(false);
  };

  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}

      <Box component="form" onSubmit={handleRegister}>
        <Stack mb={3}>
          <Typography variant="subtitle1"
            fontWeight={600} component="label" htmlFor='name' mb="5px">{t('register.name')}</Typography>
          <CustomTextField
            id="name"
            variant="outlined"
            fullWidth
            value={name}
            onChange={e => setName(e.target.value)}
            sx={(theme) => {
              const bg = theme.palette.grey[100];        // surface color for the field
              const fg = theme.palette.text.primary;

              return {
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'transparent',
                },
                '& input': {
                  WebkitTextFillColor: 'inherit',
                  color: 'inherit',
                  caretColor: fg,
                },

                // ✅ kill Chrome autofill blue/yellow and match theme
                '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus': {
                  WebkitBoxShadow: `0 0 0 1000px ${bg} inset`,
                  boxShadow: `0 0 0 1000px ${bg} inset`,
                  WebkitTextFillColor: fg,
                  caretColor: fg,
                  transition: 'background-color 9999s ease-out 0s', // old Chrome hack
                },

                // optional: keep outline color consistent on focus
                '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              };
            }}
          />

          <Typography variant="subtitle1"
            fontWeight={600} component="label" htmlFor='email' mb="5px" mt="25px">{t('register.email')}</Typography>
          <CustomTextField
            id="email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={e => setEmail(e.target.value)}
            sx={(theme) => {
              const bg = theme.palette.grey[100];        // surface color for the field
              const fg = theme.palette.text.primary;

              return {
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'transparent',
                },
                '& input': {
                  WebkitTextFillColor: 'inherit',
                  color: 'inherit',
                  caretColor: fg,
                },

                // ✅ kill Chrome autofill blue/yellow and match theme
                '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus': {
                  WebkitBoxShadow: `0 0 0 1000px ${bg} inset`,
                  boxShadow: `0 0 0 1000px ${bg} inset`,
                  WebkitTextFillColor: fg,
                  caretColor: fg,
                  transition: 'background-color 9999s ease-out 0s', // old Chrome hack
                },

                // optional: keep outline color consistent on focus
                '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              };
            }}
          />

          <Typography variant="subtitle1"
            fontWeight={600} component="label" htmlFor='username' mb="5px" mt="25px">{t('register.username')}</Typography>
          <CustomTextField
            id="username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={e => setUsername(e.target.value)}
            sx={(theme) => {
              const bg = theme.palette.grey[100];        // surface color for the field
              const fg = theme.palette.text.primary;

              return {
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'transparent',
                },
                '& input': {
                  WebkitTextFillColor: 'inherit',
                  color: 'inherit',
                  caretColor: fg,
                },

                // ✅ kill Chrome autofill blue/yellow and match theme
                '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus': {
                  WebkitBoxShadow: `0 0 0 1000px ${bg} inset`,
                  boxShadow: `0 0 0 1000px ${bg} inset`,
                  WebkitTextFillColor: fg,
                  caretColor: fg,
                  transition: 'background-color 9999s ease-out 0s', // old Chrome hack
                },

                // optional: keep outline color consistent on focus
                '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              };
            }}
          />

          <Typography variant="subtitle1"
            fontWeight={600} component="label" htmlFor='password' mb="5px" mt="25px">{t('register.password')}</Typography>
          <CustomTextField
            id="password"
            variant="outlined"
            fullWidth
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </Stack>
        {error && <Typography color="error" mb={2}>{error}</Typography>}
        {success && <Typography color="success.main" mb={2}>{success}</Typography>}
        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          type="submit"
          disabled={loading}
        >
          {loading ? t('register.signup_button_loading') || 'Loading...' : t('register.signup_button')}
        </Button>
      </Box>
      {subtitle}
    </>
  );
};


export default AuthRegister;
