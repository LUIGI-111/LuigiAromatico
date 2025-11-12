import { DataTypes } from 'sequelize';
import sequelize from '../../database/index.js';
import User from './User.js';
import Perfume from './Perfume.js';

const CartItem = sequelize.define('CartItem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 1,
        },
    },
});

User.hasMany(CartItem, { foreignKey: 'userId', onDelete: 'CASCADE' });
CartItem.belongsTo(User, { foreignKey: 'userId' });

Perfume.hasMany(CartItem, { foreignKey: 'perfumeId', onDelete: 'CASCADE' });
CartItem.belongsTo(Perfume, { foreignKey: 'perfumeId' });

export default CartItem;
