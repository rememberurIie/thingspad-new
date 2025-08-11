import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router';

import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import { Stack } from '@mui/system';

import { useTranslation } from 'react-i18next';

const AuthRegister = ({ title, subtitle, subtext }) => {

  const { t } = useTranslation();
  
  return(
  <>
        {title ? (
            <Typography fontWeight="700" variant="h2" mb={1}>
                {title}
            </Typography>
        ) : null}

        {subtext}

        <Box>
            <Stack mb={3}>
                <Typography variant="subtitle1"
                    fontWeight={600} component="label" htmlFor='name' mb="5px">{t('register.name')}</Typography>
                <CustomTextField id="name" variant="outlined" fullWidth 
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
                <CustomTextField id="email" variant="outlined" fullWidth
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
                <CustomTextField id="username" variant="outlined" fullWidth
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
                    fontWeight={600} component="label" htmlFor='password' mb="5px" mt="25px">{t('register.pasword')}</Typography>
                <CustomTextField id="password" variant="outlined" fullWidth />
            </Stack>
            <Button color="primary" variant="contained" size="large" fullWidth component={Link} to="/auth/login">
                {t('register.signup_button')}
            </Button>
        </Box>
        {subtitle}
    </>
  );
};


export default AuthRegister;
