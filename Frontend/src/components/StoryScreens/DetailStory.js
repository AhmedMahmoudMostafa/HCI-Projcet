import axios from 'axios';
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import "../../Css/DetailStory.css";
import Loader from '../GeneralScreens/Loader';
import { FaRegHeart, FaHeart, FaRegWindowClose, FaRegComment } from 'react-icons/fa';
import { RiDeleteBin6Line, RiDislikeFill } from 'react-icons/ri';
import { FiEdit, FiArrowLeft } from 'react-icons/fi';
import { BsBookmarkPlus, BsThreeDots, BsBookmarkFill, BsChatLeftQuote, BsEnvelope } from 'react-icons/bs';
import CommentSidebar from '../CommentScreens/CommentSidebar';
import { TiThumbsDown } from 'react-icons/ti';
import { IoThumbsDownSharp } from 'react-icons/io5';
import io from 'socket.io-client';

const DetailStory = () => {
  const [likeStatus, setLikeStatus] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [activeUser, setActiveUser] = useState({});
  const [story, setStory] = useState({});
  const [storyLikeUser, setStoryLikeUser] = useState([]);
  const [sidebarShowStatus, setSidebarShowStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const slug = useParams().slug;
  const [storyReadListStatus, setStoryReadListStatus] = useState(false);
  const navigate = useNavigate();

  const handleLikeProgrammatically = useCallback(async () => {
    if (!likeStatus) {
      setLikeStatus(true);
      try {
        const { data } = await axios.post(`/story/${slug}/like`, { activeUser }, {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        setLikeCount(data.data.likeCount);
        setStoryLikeUser(data.data.likes);
      } catch (error) {
        console.error('Error in liking the story programmatically:', error);
      }
    }
  }, [likeStatus, slug, activeUser]);

  useEffect(() => {
    const socket = io('http://localhost:3000');
    socket.on('likeStoryUpdate', handleLikeProgrammatically);

    return () => {
      socket.off('likeStoryUpdate', handleLikeProgrammatically);
      socket.disconnect();
    };
  }, [handleLikeProgrammatically]);

  useEffect(() => {
    const getDetailStory = async () => {
      setLoading(true);
      try {
        const authResponse = await axios.get("/auth/private", {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        setActiveUser(authResponse.data.user);

        const storyResponse = await axios.post(`/story/${slug}`, { activeUser: authResponse.data.user });
        setStory(storyResponse.data.data);
        setLikeStatus(storyResponse.data.likeStatus);
        setLikeCount(storyResponse.data.data.likeCount);
        setStoryLikeUser(storyResponse.data.data.likes);
      } catch (error) {
        navigate("/not-found");
      } finally {
        setLoading(false);
      }
    };
    getDetailStory();
  }, [slug, navigate]);

  const handleLike = async () => {
    setLikeStatus(!likeStatus);
    try {
      const { data } = await axios.post(`/story/${slug}/like`, { activeUser }, {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      setLikeCount(data.data.likeCount);
      setStoryLikeUser(data.data.likes);
    } catch (error) {
      setStory({});
      localStorage.removeItem("authToken");
      navigate("/");
    }
  };

  const handleDelete = async () => {

    if (window.confirm("Do you want to delete this post")) {

      try {

        await axios.delete(`/story/${slug}/delete`, {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        })
        navigate("/")

      }
      catch (error) {
        console.log(error)
      }

    }

  }


  const editDate = (createdAt) => {

    const d = new Date(createdAt)
      ;
    var datestring = d.toLocaleString('eng', { month: 'long' }).substring(0, 3) + " " + d.getDate()
    return datestring
  }

  const addStoryToReadList = async () => {

    try {

      const { data } = await axios.post(`/user/${slug}/addStoryToReadList`, { activeUser }, {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      })

      setStoryReadListStatus(data.status)

      document.getElementById("readListLength").textContent = data.user.readListLength
    }
    catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      {
        loading ? <Loader /> :
          <>

            <div className='Inclusive-detailStory-page'>

              <div className="top_detail_wrapper">
                <Link to={'/'} >
                  <FiArrowLeft />
                </Link>
                <h5>{story.title}</h5>

                <div className='story-general-info'>

                  <ul>
                    {story.author &&
                      <li className='story-author-info'>
                        <img src={`/userPhotos/${story.author.photo}`} alt={story.author.username} />
                        <span className='story-author-username'>{story.author.username}  </span>
                      </li>
                    }
                    <li className='story-createdAt'>
                      {
                        editDate(story.createdAt)
                      }
                    </li>
                    <b>-</b>

                    <li className='story-readtime'>
                      {story.readtime} min read

                    </li>

                  </ul>

                  {
                    !activeUser.username &&
                    <div className='comment-info-wrap'>

                      <i onClick={(prev) => {
                        setSidebarShowStatus(!sidebarShowStatus)
                      }}>
                        <FaRegComment />
                      </i>


                      <b className='commentCount'>{story.commentCount}</b>

                    </div>
                  }

                  {activeUser && story.author &&
                    story.author._id === activeUser._id ?
                    <div className="top_story_transactions">
                      <Link className='editStoryLink' to={`/story/${story.slug}/edit`}>
                        <FiEdit />
                      </Link>
                      <span className='deleteStoryLink' onClick={handleDelete}>
                        <RiDeleteBin6Line />
                      </span>
                    </div> : null
                  }
                </div>

              </div>

              <div className="CommentFieldEmp">

                <CommentSidebar slug={slug} sidebarShowStatus={sidebarShowStatus} setSidebarShowStatus={setSidebarShowStatus}
                  activeUser={activeUser}
                />

              </div>

              <div className='story-content' >

                <div className="story-banner-img">
                  <img src={`/storyImages/${story.image}`} alt={story.title} />

                </div>

                <div className='content' dangerouslySetInnerHTML={{ __html: (story.content) }}>
                </div>

              </div>

              {activeUser.username &&
                <div className='fixed-story-options'>

                  <ul>
                    <li>

                      <i onClick={handleLike} >

                        {likeStatus ? <IoThumbsDownSharp color="#0063a5" /> :
                          <TiThumbsDown />
                        }
                      </i>

                      <b className='likecount'
                        style={likeStatus ? { color: "#0063a5" } : { color: "rgb(99, 99, 99)" }}
                      >  {likeCount}
                      </b>

                    </li>


                    <li>
                      <i onClick={(prev) => {
                        setSidebarShowStatus(!sidebarShowStatus)
                      }}>
                        <BsEnvelope />
                      </i>

                      <b className='commentCount'>{story.commentCount}</b>

                    </li>

                  </ul>

                  <ul>
                    {/* <li>
                      <i onClick={addStoryToReadList}>

                        {storyReadListStatus ? <BsBookmarkFill color='#0205b1' /> :
                          <BsBookmarkPlus />
                        }
                      </i>
                    </li> */}

                    <li className='BsThreeDots_opt'>
                      <i  >
                        <BsThreeDots />
                      </i>

                      {activeUser &&
                        story.author._id === activeUser._id ?
                        <div className="delete_or_edit_story  ">
                          <Link className='editStoryLink' to={`/story/${story.slug}/edit`}>
                            <p>Edit Story</p>
                          </Link>
                          <div className='deleteStoryLink' onClick={handleDelete}>
                            <p>Delete Story</p>
                          </div>
                        </div> : null
                      }

                    </li>

                  </ul>

                </div>
              }

            </div>
          </>
      }
    </>
  )
}

export default DetailStory;
