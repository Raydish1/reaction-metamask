import RootLayout from './layout';

import PromptCard from '../components/PromptCard';


const Home = () => {
    return (
        <RootLayout>
            <section>
                <h1>Raydish Bot</h1>
                <p>A website to find everything about your Brawlhalla stats</p>

        <PromptCard />

        </section>
        </RootLayout>
    )
}

export default Home
