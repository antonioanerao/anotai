ALTER TABLE "PlatformSettings"
ADD COLUMN "siteTitle" TEXT NOT NULL DEFAULT 'AnotAI',
ADD COLUMN "homeTitle" TEXT NOT NULL DEFAULT 'Compartilhamento de codigo para treinamentos',
ADD COLUMN "metaDescription" TEXT NOT NULL DEFAULT 'Crie e compartilhe blocos de codigo por URL com leitura publica, modos de edicao e colaboracao para aulas, treinamentos e suporte tecnico.',
ADD COLUMN "canonicalUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN "ogImagePath" TEXT NOT NULL DEFAULT '',
ADD COLUMN "indexHome" BOOLEAN NOT NULL DEFAULT true;
