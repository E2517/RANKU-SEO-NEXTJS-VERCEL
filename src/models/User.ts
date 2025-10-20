import { Schema, model, models, Model } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser {
    username: string;
    email: string;
    password?: string;
    googleId?: string | null;
    subscriptionPlan: string;
    subscriptionId?: string;
    subscriptionStartDate?: Date;
    subscriptionEndDate?: Date;
    stripeCustomerId?: string;
    isSubscriptionCanceled: boolean;
    role: 'admin' | 'user';
    limitKeywords: number;
    limitScanMap: number;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    preferredLocale: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface IUserMethods {
    comparePassword(candidatePassword: string): Promise<boolean>;
}

type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: String,
        googleId: String,
        subscriptionPlan: { type: String, default: 'Gratuito' },
        subscriptionId: String,
        subscriptionStartDate: Date,
        subscriptionEndDate: Date,
        stripeCustomerId: String,
        isSubscriptionCanceled: { type: Boolean, default: false },
        role: { type: String, default: 'user', enum: ['admin', 'user'] },
        limitKeywords: { type: Number, default: 0 },
        limitScanMap: { type: Number, default: 0 },
        resetPasswordToken: String,
        resetPasswordExpires: Date,
        preferredLocale: { type: String, default: 'en' },
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

const User = (models.User as UserModel) || model<IUser, UserModel>('User', userSchema);
export default User;