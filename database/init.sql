CREATE DATABASE IF NOT EXISTS card_game;
CREATE USER IF NOT EXISTS 'card_game_user'@'localhost' IDENTIFIED BY 'pass';
GRANT ALL ON card_game.* TO 'card_game_user'@'localhost';