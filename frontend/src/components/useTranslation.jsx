import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <Button type="primary">{t('submit')}</Button>
    </div>
  );
}
