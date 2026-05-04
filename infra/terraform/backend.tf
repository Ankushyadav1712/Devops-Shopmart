terraform {
  backend "s3" {
    # bucket / region / key are passed via -backend-config from CI
    encrypt = true
  }
}
