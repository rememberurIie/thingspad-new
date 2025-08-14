import { ToggleButtonGroup, ToggleButton } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitch({ size = 'small', ...props }) {
  const { i18n } = useTranslation();

  const handleChange = (_, lang) => {
    if (lang && lang !== i18n.language) i18n.changeLanguage(lang);
  };

  return (
    <ToggleButtonGroup
      exclusive
      value={i18n.language}
      onChange={handleChange}
      size={size}
      {...props}
    >
      <ToggleButton value="th">TH</ToggleButton>
      <ToggleButton value="en">EN</ToggleButton>
      
    </ToggleButtonGroup>
  );
}
