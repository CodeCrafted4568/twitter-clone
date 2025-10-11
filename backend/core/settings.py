from pathlib import Path
from datetime import timedelta
import os

BASE_DIR = Path(__file__).resolve().parent.parent

# ---------------------------------------------------------------------
# Básico
# ---------------------------------------------------------------------
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-secret-change-me")
DEBUG = os.getenv("DJANGO_DEBUG", "False").lower() == "true"

# ALLOWED_HOSTS: passe "host1,host2" via env ALLOWED_HOSTS ou deixe "*" em dev
_allowed = os.getenv("ALLOWED_HOSTS", "*")
ALLOWED_HOSTS = [h.strip() for h in _allowed.split(",") if h.strip()]

LANGUAGE_CODE = "pt-br"
TIME_ZONE = "America/Sao_Paulo"
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ---------------------------------------------------------------------
# Apps & Middleware
# ---------------------------------------------------------------------
INSTALLED_APPS = [
    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # 3rd party
    "corsheaders",
    "rest_framework",
    "rest_framework.authtoken",

    # Local
    "app.api",
    "app.users.api",

    # WhiteNoise helper p/ dev (opcional)
    "whitenoise.runserver_nostatic",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",           # deve ser o mais alto possível
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",      # logo após Security
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "core.urls"

TEMPLATES = [{
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "DIRS": [BASE_DIR / "templates"],
    "APP_DIRS": True,
    "OPTIONS": {
        "context_processors": [
            "django.template.context_processors.debug",
            "django.template.context_processors.request",
            "django.contrib.auth.context_processors.auth",
            "django.contrib.messages.context_processors.messages",
        ],
    },
}]

WSGI_APPLICATION = "core.wsgi.application"

# ---------------------------------------------------------------------
# Banco de Dados
# - Se DATABASE_URL estiver definido (p.ex. Render), usa ele
# - Caso contrário usa variáveis separadas (bom para docker local)
# ---------------------------------------------------------------------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB", "twitterdb"),
        "USER": os.getenv("POSTGRES_USER", "twitter"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD", "twitter"),
        "HOST": os.getenv("DB_HOST", "127.0.0.1"),
        "PORT": os.getenv("DB_PORT", "5434"),
    }
}

# Se existir DATABASE_URL (p.ex. Render/Postgres), sobrescreve
if os.getenv("DATABASE_URL"):
    import dj_database_url
    DATABASES = {
        "default": dj_database_url.parse(os.getenv("DATABASE_URL"), conn_max_age=600)
    }

# ---------------------------------------------------------------------
# Static & Media (WhiteNoise)
# ---------------------------------------------------------------------
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# ---------------------------------------------------------------------
# DRF & JWT
# ---------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# ---------------------------------------------------------------------
# CORS / CSRF (Front em Vercel + backend no Render ou local)
# ---------------------------------------------------------------------
# URL do frontend (adicione essa variável no Vercel: FRONTEND_URL=https://seu-front.vercel.app)
FRONTEND_URL = os.getenv("FRONTEND_URL", "").strip()

# Origins permitidas (dev + vercel + FRONTEND_URL)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    # domínio de produção do front (exemplo Vercel)
    "https://twitter-clone-beta-sandy.vercel.app",
]
if FRONTEND_URL:
    CORS_ALLOWED_ORIGINS.append(FRONTEND_URL)

# Permite previews vercel.app (subdomínios)
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",
]

# Como usamos JWT via Authorization header, normalmente não precisamos de cookies
CORS_ALLOW_CREDENTIALS = False

# CSRF trusted (necessário apenas se usar cookies/session)
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://twitter-clone-beta-sandy.vercel.app",
]
if FRONTEND_URL and FRONTEND_URL.startswith("https://"):
    CSRF_TRUSTED_ORIGINS.append(FRONTEND_URL)
# também permitir subdomínios Vercel
CSRF_TRUSTED_ORIGINS += ["https://*.vercel.app"]

# ---------------------------------------------------------------------
# Segurança extra quando DEBUG=False (produção)
# ---------------------------------------------------------------------
if not DEBUG:
    # necessário quando o app está atrás de um proxy (Render, etc)
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    # redireciona para https (configurável)
    SECURE_SSL_REDIRECT = os.getenv("DJANGO_SECURE_SSL_REDIRECT", "True").lower() == "true"
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    # HSTS
    SECURE_HSTS_SECONDS = int(os.getenv("SECURE_HSTS_SECONDS", 63072000))
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

# ---------------------------------------------------------------------
# Logging mínimo (útil para ver erros no Render)
# ---------------------------------------------------------------------
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {"class": "logging.StreamHandler"},
    },
    "root": {
        "handlers": ["console"],
        "level": os.getenv("DJANGO_LOG_LEVEL", "INFO"),
    },
}

# ---------------------------------------------------------------------
# Outras configurações (adapte se precisar)
# ---------------------------------------------------------------------
# Timeouts, email, etc — preencher conforme necessário por env vars

# Exemplo: se você expuser alguma URL de logout para o front
LOGOUT_REDIRECT_URL = os.getenv("VITE_LOGOUT_REDIRECT", "/")

# ---------------------------------------------------------------------
# Importe variáveis sensíveis adicionais do ambiente se precisar:
# ---------------------------------------------------------------------
# Exemplo:
# EMAIL_HOST = os.getenv("EMAIL_HOST")
# ...

