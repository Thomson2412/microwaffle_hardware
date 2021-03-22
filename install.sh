sudo apt install nodejs -y
sudo apt install npm -y
npm install
sudo mv microwaffle.service /etc/systemd/system/
sudo systemctl enable microwaffle
sudo systemctl start microwaffle
