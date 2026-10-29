# backend/app/secrets.example.py
# Copy this file to backend/app/secrets.py and fill in your keys.
# NEVER commit secrets.py to Git.

PAYPAL_CLIENT_ID = ""
PAYPAL_CLIENT_SECRET = ""
PAYPAL_WEBHOOK_ID = ""      # from the PayPal sandbox app after registering the webhook
AI_API_KEY = ""
ELASTIC_URL = ""            # only when USE_ELASTIC = True
ELASTIC_API_KEY = ""
KERNEL_API_KEY = ""         # only if you build the stretch feature
APPROVAL_SECRET = ""        # any long random string, protects the approve endpoint
