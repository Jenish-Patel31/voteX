# VoteX Backend Deployment Guide

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Blockchain Configuration
RPC_URL=https://your-rpc-endpoint.com
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=0xYourContractAddress

# Server Configuration
PORT=5000

# Environment
NODE_ENV=production
```

## Production Deployment

1. **Set NODE_ENV to production** to disable debug logs:
   ```env
   NODE_ENV=production
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

## Error Logging

- **Development**: Full error logs with stack traces
- **Production**: Only essential error messages, no verbose logging

## Security Notes

- Never commit your `.env` file to version control
- Use environment variables for all sensitive data
- Ensure your private key is secure and not exposed

## Health Check

The backend will respond with appropriate HTTP status codes:
- 200: Success
- 400: Bad Request
- 403: Forbidden (unauthorized actions)
- 500: Internal Server Error

All errors are returned as JSON with an `error` field containing the message.
