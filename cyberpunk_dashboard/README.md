# 🦊 Arcadian Media - Cyberpunk Morning Briefing Dashboard

A futuristic, orange-and-black themed dashboard that displays your daily morning briefing with live updates.

## 🚀 Features

- **Cyberpunk Orange/Black Theme** - Neon orange accents on dark background
- **Live News Ticker** - Scrolling news feed at the top
- **Breaking News Banner** - Clear alerts for important news
- **11 AM Daily Updates** - Auto-refreshes at 11 AM London time
- **Public URL Access** - Accessible from anywhere
- **Responsive Design** - Works on desktop and mobile

## 📊 Dashboard Sections

1. **To-Do List** - From your `todo.md` file
2. **Shopping List** - From your `shopping.md` file  
3. **Weather Outlook** - Current weather with outfit advice
4. **Travel Deals** - Daily flight and hotel deals
5. **Air Quality** - Health-focused air quality report
6. **Top News** - Latest news headlines
7. **Sports News** - Sports updates and scores
8. **Daily Horoscope** - Personalized horoscope reading
9. **Pythagorean Numerology** - Daily numerology reading
10. **Motivational Quote** - Inspirational quote of the day

## 🛠️ Installation & Setup

### 1. Start the Dashboard
```bash
cd /home/node/.openclaw/workspace/cyberpunk_dashboard
./start.sh
```

The dashboard will start on `http://localhost:5000`

### 2. Set Up Public URL (Optional)
To access from anywhere, use a tunneling service:
```bash
# Using ngrok (if installed)
ngrok http 5000
```

### 3. Set Up Daily 11 AM Updates
```bash
./setup_daily_update.sh
```
Follow the instructions to add the cron job.

## 🔧 Configuration

### Data Sources
The dashboard automatically reads from:
- `todo.md` - Your to-do list
- `shopping.md` - Your shopping list
- Other data files in the workspace

### Customizing Colors
Edit `static/css/style.css` to change the orange/black theme.

### Adding APIs
Edit `app.py` to integrate additional data sources:
- Weather APIs
- News APIs  
- Sports APIs
- Horoscope APIs

## 📱 Accessing the Dashboard

Once running, access at:
- **Local**: `http://localhost:5000`
- **Network**: `http://[YOUR_IP]:5000`
- **Public**: `http://[YOUR_PUBLIC_URL]`

## 🕐 Update Schedule

- **Manual Refresh**: Click "MANUAL REFRESH" button
- **Auto Refresh**: Every 5 minutes in browser
- **Daily Data Update**: 11 AM London time (via cron)
- **Breaking News**: Real-time when available

## 🐛 Troubleshooting

### Dashboard won't start
- Check Python is installed: `python3 --version`
- Check port 5000 is free: `netstat -tuln | grep :5000`

### No data showing
- Check data files exist in workspace
- Check API keys are configured (if using external APIs)
- Check console for errors

### Styling issues
- Clear browser cache
- Check CSS file is loading (F12 Developer Tools)

## 🔮 Future Enhancements

Planned features:
- User authentication
- Customizable widgets
- Notification system
- Mobile app version
- Voice control integration
- More data sources

## 📞 Support

For issues or feature requests:
- Check the console output
- Review log files in `data/` directory
- Contact your AI assistant Lola 🦊

---

**Powered by Lola AI | Arcadian Media Network**