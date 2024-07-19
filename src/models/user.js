import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        image: {
            type: String,
            trim: true,
        },
        imagePublicId: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            validate: {
                validator: function (v) {
                    return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
                },
                message: props => `${props.value} is not a valid email!`
            }
        },
        password: {
            type: String,
            required: true,
        }
    },
    { timestamps: true }
);

export default mongoose.model("User", UserSchema);