import { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../context/SocketContext';

export default function ProductList() {
    const { sendSocketMessage, socketData, isConnected } = useContext(SocketContext);
    const [products, setProducts] = useState([]);
    const messageType = 'getProducts';

    useEffect(() => {
        if (isConnected) {
            sendSocketMessage({}, messageType);
        }
        // eslint-disable-next-line
    }, [isConnected]);

    useEffect(() => {
        if (socketData && socketData.type === messageType) {
            console.log('ürünler geldi : ',socketData);
            if (socketData.message && socketData.message.status === 'success' && socketData.message.products) {
                setProducts(socketData.message.products);
            }
        }
    }, [socketData]);

    return (
        <div>
            <h1>Product List</h1>
            <ul>
                {products.map((product,index) => (

                    <li key={product._id}>
                        <h2>{product.productname}</h2>
                        <p>Category: {product.productcategory}</p>
                        <p>Sizes:</p>
                        <ul>
                            {product.sizes.map(size => (
                                <li key={size._id}>
                                    {size.size}: ${size.price}
                                </li>
                            ))}
                        </ul>
                        <p>Contents:</p>
                        <div>{index}</div>
                        <ul>
                            {product.contents.map(content => (
                                <li key={content._id}>
                                    {content.name} (+${content.extraFee})
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    );
}
