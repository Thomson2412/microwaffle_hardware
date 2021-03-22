sudo apt install nodejs
sudo apt install npm
npm install
sudo mv microwaffle.service /etc/systemd/system/
sudo systemctl enable microwaffle
sudo systemctl start microwaffle
