import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import SkeletonStory from '../Skeletons/SkeletonStory';
import CardStory from '../StoryScreens/CardStory';
import NoStories from '../StoryScreens/NoStories';
import Pagination from './Pagination';
import '../../Css/Home.css';

const Home = () => {
    const search = useLocation().search;
    const navigate = useNavigate();
    const searchKey = new URLSearchParams(search).get('search');
    const [stories, setStories] = useState([]);
    const [storyTitles, setStoryTitles] = useState([]);
    const [counter, setCounter] = useState(0);
    const [loading, setLoading] = useState(true);
    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(1);
    const [displayCategories, setDisplayCategories] = useState([]);

    useEffect(() => {
        const socket = io('http://localhost:3000');

        socket.on('categoryUpdate', (data) => {
            const categoriesToShow = Object.keys(data).filter(category => data[category]);
            setDisplayCategories(categoriesToShow);
        });

        socket.on('counterUpdate', (updateValue) => {
            setCounter(prevCounter => prevCounter + updateValue);
        });

        socket.on('navigateToStory', () => {
            if (storyTitles[counter]) {
                navigate(`/story/${storyTitles[counter]}`);
            }
        });

        return () => socket.disconnect();
    }, [counter, storyTitles, navigate]);

    useEffect(() => {
        const fetchStories = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/story/getAllStories?search=${searchKey || ''}&page=${page}`);
                let fetchedStories = response.data.data;

                if (displayCategories.length > 0) {
                    fetchedStories = fetchedStories.filter(story => displayCategories.includes(story.category));
                }

                setStories(fetchedStories);
                setPages(response.data.pages);
            } catch (error) {
                console.error('Error fetching stories:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStories();
    }, [search, page, displayCategories]);

    useEffect(() => {
        // Update story titles whenever the stories array changes
        setStoryTitles(stories.map(story => story.slug));
    }, [stories]);

    useEffect(() => {
        setPage(1);
    }, [searchKey]);

    return (
        <div className="Inclusive-home-page">
            {/* Display the counter */}
            <div className="counter-display">
                <h2>Selected Tree Index: {counter}</h2>
            </div>

            {loading ? (
                <div className="skeleton_emp">
                    {[...Array(6)].map(() => <SkeletonStory key={uuidv4()} />)}
                </div>
            ) : (
                <div>
                    <div className="story-card-wrapper">
                        {stories.length > 0 ? (
                            stories.map((story) => <CardStory key={story._id} story={story} />)
                        ) : (
                            <NoStories />
                        )}
                    </div>
                    <Pagination page={page} pages={pages} changePage={setPage} />
                </div>
            )}
            <br />
        </div>
    );
};

export default Home;
