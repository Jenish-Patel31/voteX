# VoteX - Decentralized Voting Platform

A modern, secure blockchain-based voting platform built with React and Node.js, featuring MetaMask wallet integration and smart contract functionality.

## 🚀 Features

- **Secure Blockchain Voting**: Built on Ethereum smart contracts
- **MetaMask Integration**: Wallet-based authentication and voting
- **Real-time Results**: Live election results with interactive charts
- **Admin Panel**: Manage candidates, authorize voters, and control elections
- **Responsive Design**: Modern UI with Tailwind CSS
- **Error Handling**: User-friendly error messages and retry mechanisms
- **Loading States**: Smooth loading experiences with spinners

## 🏗️ Architecture

### Frontend (React)
- **Dashboard**: Election overview and quick actions
- **Voting**: Cast votes with MetaMask wallet
- **Results**: Live results with charts and statistics
- **Admin Panel**: Election management interface

### Backend (Node.js)
- **REST API**: Express.js server with blockchain integration
- **Smart Contract**: Ethereum-based voting contract
- **Error Handling**: Production-ready error logging

## 🛠️ Tech Stack

### Frontend
- React 18
- Tailwind CSS
- React Router
- Axios
- Lucide React (Icons)
- React Hot Toast (Notifications)

### Backend
- Node.js
- Express.js
- Ethers.js (Blockchain integration)
- CORS
- Dotenv

### Blockchain
- Ethereum Smart Contract
- MetaMask Wallet Integration

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MetaMask browser extension
- Ethereum wallet with testnet ETH

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Jenish-Patel31/voteX.git
cd voteX
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
RPC_URL=https://your-rpc-endpoint.com
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=0xYourContractAddress
PORT=5000
NODE_ENV=development
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Run the Application
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3001
- Backend: http://localhost:5000

## 📱 Usage

### For Voters
1. Install MetaMask browser extension
2. Connect your wallet to the application
3. Check your voting eligibility
4. Select a candidate and cast your vote

### For Admins
1. Access the Admin Panel
2. Add candidates to the election
3. Authorize eligible voters
4. Monitor election progress
5. End the election when complete

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
RPC_URL=https://your-ethereum-rpc-endpoint
PRIVATE_KEY=your_wallet_private_key
CONTRACT_ADDRESS=0xYourDeployedContractAddress
PORT=5000
NODE_ENV=production
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Smart Contract Deployment
1. Deploy the voting contract to your preferred Ethereum network
2. Update the `CONTRACT_ADDRESS` in your backend `.env` file
3. Ensure your wallet has the necessary permissions

## 🚀 Deployment

### Production Deployment

#### Backend
1. Set `NODE_ENV=production` in your environment variables
2. Deploy to your preferred hosting service (Heroku, AWS, etc.)
3. Update the frontend API URL to point to your deployed backend

#### Frontend
1. Update `REACT_APP_API_URL` to your deployed backend URL
2. Build the application: `npm run build`
3. Deploy the `build` folder to your hosting service

### Environment-Specific Settings
- **Development**: Full error logging and debugging
- **Production**: Clean logs and optimized performance

## 📁 Project Structure

```
voteX/
├── backend/
│   ├── controllers/
│   │   └── contractController.js
│   ├── routes/
│   │   └── contractRoutes.js
│   ├── abi.json
│   ├── index.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   └── utils/
│   └── package.json
├── contracts/
│   └── voting.sol
└── README.md
```

## 🔒 Security Features

- **Wallet Authentication**: MetaMask integration for secure voting
- **Smart Contract Validation**: All votes validated on-chain
- **One Vote Per Address**: Prevents duplicate voting
- **Admin Controls**: Secure election management
- **Error Handling**: User-friendly error messages

## 🐛 Troubleshooting

### Common Issues

1. **MetaMask Connection Issues**
   - Ensure MetaMask is installed and unlocked
   - Check if you're on the correct network
   - Verify wallet permissions

2. **Backend Connection Errors**
   - Check if the backend server is running
   - Verify the API URL in frontend configuration
   - Ensure environment variables are set correctly

3. **Blockchain Transaction Failures**
   - Check if you have sufficient ETH for gas fees
   - Verify the contract address is correct
   - Ensure the RPC endpoint is accessible

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Jenish Patel**
- GitHub: [@Jenish-Patel31](https://github.com/Jenish-Patel31)

## 🙏 Acknowledgments

- Ethereum Foundation for blockchain technology
- MetaMask for wallet integration
- React and Node.js communities
- All contributors and testers

---

**Note**: This is a demonstration project. For production use, ensure proper security audits and testing.
