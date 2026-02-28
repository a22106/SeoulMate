"""GCP Secret Manager에서 환경변수를 로드하는 모듈.

사용 방식:
  - GCP_SECRET_ENV 환경변수가 설정되어 있으면 Secret Manager에서 시크릿을 가져와 os.environ에 주입.
  - 형식: GCP_SECRET_ENV=project_id/secret_name (예: buoyant-sunbeam-466409-e7/seoulmate-env)
  - 시크릿 값은 KEY=VALUE 형식의 줄로 구성 (.env 파일과 동일한 형식).
  - GCP_SECRET_ENV가 없으면 기존 .env 파일 로드 방식(dotenv)을 그대로 사용.
"""

import os
import logging

logger = logging.getLogger(__name__)


def load_secrets() -> None:
    """GCP Secret Manager에서 시크릿을 가져와 환경변수로 설정한다.

    GCP_SECRET_ENV 환경변수가 없으면 아무 동작도 하지 않고 즉시 반환.
    이 경우 기존 dotenv 방식이 그대로 동작한다.
    """
    secret_ref = os.getenv("GCP_SECRET_ENV")
    if not secret_ref:
        logger.info("GCP_SECRET_ENV not set — skipping Secret Manager, using .env")
        return

    try:
        from google.cloud import secretmanager

        parts = secret_ref.split("/")
        if len(parts) == 2:
            project_id, secret_id = parts
            version = "latest"
        elif len(parts) == 3:
            project_id, secret_id, version = parts
        else:
            logger.error("GCP_SECRET_ENV format must be: project_id/secret_name[/version]")
            return

        client = secretmanager.SecretManagerServiceClient()
        name = f"projects/{project_id}/secrets/{secret_id}/versions/{version}"
        response = client.access_secret_version(request={"name": name})
        payload = response.payload.data.decode("utf-8")

        count = 0
        for line in payload.splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" not in line:
                continue
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip()
            # 기존 환경변수가 이미 있으면 덮어쓰지 않음 (Docker env 등 우선)
            if key not in os.environ:
                os.environ[key] = value
                count += 1

        logger.info("Loaded %d env vars from Secret Manager (%s)", count, secret_id)

    except ImportError:
        logger.warning("google-cloud-secret-manager not installed — skipping")
    except Exception as e:
        logger.error("Failed to load secrets from GCP: %s", e)
        raise
