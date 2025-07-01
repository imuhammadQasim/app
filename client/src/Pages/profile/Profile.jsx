import React from 'react'
import './profile.css'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import { useState, useEffect } from 'react'
import { uploadProfilePic } from '../../apiCalls/user'
import { hideLoader, showLoader } from '../../redux/loaderSlice'
import { setUser } from '../../redux/userSlice'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom';
const Profile = () => {
    const { user } = useSelector(state => state.user)
    const [image, setImage] = useState('')
    const dispatch = useDispatch();
    function getInitials() {
        if (!user || !user.firstname || !user.lastname) {
            return "??"; // Default initials if user data is not available
        }
        const firstInitial = user.firstname.charAt(0).toUpperCase();
        const lastInitial = user.lastname.charAt(0).toUpperCase();
        return `${firstInitial}${lastInitial}`;
    }

    function getFullName() {
        if (!user || !user.firstname || !user.lastname) return "Unknown";
        let fname = user.firstname.charAt(0).toUpperCase() + user.firstname.slice(1).toLowerCase();
        let lname = user.lastname.charAt(0).toUpperCase() + user.lastname.slice(1).toLowerCase();
        return `${fname} ${lname}`;
    }

    const onFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onloadend = () => {
            setImage(reader.result);
        };
    };

    const updateProfilePicture = async () => {
        try {
            if (!image || image === user.profilePic) {
                toast.error('Please select a new picture to upload');
                return;
            }
            dispatch(showLoader())
            const response = await uploadProfilePic(image);
            dispatch(hideLoader())

            if (response.success) {
                toast.success(response.message)
                dispatch(setUser(response.data))
            } else {
                toast.error(response.data)
            }
        } catch (err) {
            toast.error(err.message)
            dispatch(hideLoader())
        }
    }


    useEffect(() => {
        if (user.profilePic) {
            setImage(user.profilePic);
        }
    }, [user])

    return (
        <div>
            <Link to="/" className='btn-backTo-home'>Back To Home</Link>
            <div className="profile-page-container">
                <div className="profile-pic-container">
                    {image ? (
                        <img src={image}
                            alt="Profile Pic"
                            className="user-profile-pic-upload"
                        />
                    ) : <div className="user-default-profile-avatar">
                        {getInitials()}
                    </div>}

                </div>

                <div className="profile-info-container">
                    <div className="user-profile-name">
                        <h1>{getFullName()}</h1>
                    </div>
                    <div>
                        <b>Email: </b>{user.email}
                    </div>
                    <div>
                        <b>Account Created: </b>{moment(user?.createAt).format('YYYY MMM DD ')}
                    </div>
                    <div className="select-profile-pic-container">
                        <input type="file" onChange={onFileSelect} />
                        <button className='upload-image-btn ' onClick={updateProfilePicture}>Upload</button>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default Profile
