import React from "react";
import { Link } from "react-router-dom";
import HomePageLayout from "./HomePageLayout";
import styles from "../styles/Home.module.css";

const Home: React.FC = () => {
	return (
		<HomePageLayout>
			<div className={styles.homeContent}>
				<h1 className={styles.title}>Spider Solitaire</h1>
				<p className={styles.subtitle}>Free Online Card Game</p>
				<Link to="/game" className={styles.startButton}>
					Start Game
				</Link>
				<div className={styles.rules}>
					<h2>How to Play</h2>
					<ul>
						<li>Arrange cards from King to Ace</li>
						<li>Complete 8 sets to win</li>
						<li>Use stock cards when stuck</li>
						<li>Only face-up cards can move</li>
					</ul>
				</div>
			</div>
		</HomePageLayout>
	);
};

export default Home;
