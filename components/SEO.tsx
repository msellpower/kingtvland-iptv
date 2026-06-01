import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../i18n/LanguageContext';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  schema?: object | object[];
  canonical?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  keywords, 
  schema, 
  canonical,
  image = 'https://kingtvland-iptv.netlify.app/og-image.jpg', // A generic default image
  url = 'https://kingtvland-iptv.netlify.app',
  type = 'website'
}) => {
  const { t } = useLanguage();
  const siteTitle = t('seo.defaultTitle') || 'KINGTVLAND - מנוי טלוויזיה המוביל בישראל';
  const siteDesc = t('seo.default.description') || 'KINGTVLAND - כל ערוצי הספורט, סרטים וסדרות מכל העולם';
  
  const fullTitle = title && title !== siteTitle ? `${title} | KINGTVLAND` : siteTitle;
  const fullDescription = description || siteDesc;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {keywords && <meta name="keywords" content={keywords.join(', ')} />}
      
      {/* OpenGraph / Facebook */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="KINGTVLAND" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={image} />
      
      {canonical && <link rel="canonical" href={canonical} />}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
