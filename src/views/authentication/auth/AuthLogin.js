import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Button,
  Stack,
  Checkbox,
  Alert
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';

import { useTheme } from "@mui/material/styles";


import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import { loginSuccess } from '../../../session/authSlice';

import { useTranslation } from 'react-i18next';

const AuthLogin = ({ title, subtitle, subtext }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  const { t } = useTranslation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://192.168.1.34:3000/api/account/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error('Invalid email or password');
      }

      const userInfo = await res.json();
      dispatch(loginSuccess(userInfo));
      sessionStorage.setItem('user', JSON.stringify(userInfo));

      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError("login.invalid_user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {title && (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      )}

      {subtext}

      {error && (
        <Alert severity="error" sx={{ my: 2, '& .MuiAlert-message': { pt: 1.2 }}}>
          {t(error)} 
        </Alert>
      )}

      <form onSubmit={handleLogin}>
        <Stack>
          <Box>
            <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="email" mb="5px">
              {t('login.email')}
            </Typography>
            <CustomTextField
              id="email"
              type="email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
          </Box>

          <Box mt="25px">
            <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="password" mb="5px">
              {t('login.password')}
            </Typography>
            <CustomTextField
              id="password"
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Box>

          <Stack justifyContent="space-between" direction="row" alignItems="center" my={2}>
            <FormGroup>
              <FormControlLabel control={<Checkbox defaultChecked={false} />} label={t('login.mem_device')} />
            </FormGroup>
            <Typography
              component={Link}
              to="/forgot-password"
              fontWeight="500"
              sx={{
                textDecoration: 'none',
                color: 'primary.main',
              }}
            >
              {t('login.forgot_pass')}
            </Typography>
          </Stack>
        </Stack>

        <Box>
          <Button
            color="primary"
            variant="contained"
            size="large"
            fullWidth
            type="submit"
            disabled={loading}
          >
            {loading ? t('login.signin_button_loading') : t('login.signin_button')}
          </Button>
        </Box>
      </form>

      {subtitle}
    </>
  );
};

export default AuthLogin;
