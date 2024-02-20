import React, { useState } from 'react';
import './AddProduct.css';
import { Select } from 'antd';
const { Option } = Select;
import upload_area from '../../assets/upload_area.svg';

const AddProduct = () => {
  const [image, setImage] = useState(false);
  const [productDetails, setProductDetails] = useState({
    name: '',
    image: '',
    category: 'women',
    new_price: '',
    old_price: '',
  });

  const imageHandler = (e) => {
    setImage(e.target.files[0]);
  };

  const AddProduct = async () => {
    console.log(productDetails);
    let responceData;
    let product=productDetails;

    let formData = new FormData();
    formData.append('product',image);

    await fetch ('http://localhost:4000/upload',{
      method:'POST',
      headers:{
        Accept:'application/json'
      },
      body:formData,
    }).then((resp)=>resp.json()).then((data)=>{responceData=data})

    if (responceData.success){
      product.image = responceData.image_url;
      console.log(product);
      await fetch('http://localhost:4000/addproduct',{
        method:"POST",
        headers:{
          Accept:'application/json',
          'Content-Type': 'application/json',

        },
        body:JSON.stringify(product),
      }).then((resp)=>resp.json()).then((data)=>{
        data.success?alert("product Added"):alert("Failed")
      })
    }
  };

  const changeHandler = (value, name) => {
    setProductDetails({ ...productDetails, [name]: value });
  };

  return (
    <div className="add-product">
      <div className="addproduct-itemfield">
        <p>Product title</p>
        <input
          value={productDetails.name}
          onChange={(e) => changeHandler(e.target.value, 'name')}
          type="text"
          name="name"
          placeholder="Type Here"
        />
      </div>
      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Price</p>
          <input
            value={productDetails.old_price}
            onChange={(e) => changeHandler(e.target.value, 'old_price')}
            type="text"
            name="old_price"
            placeholder="Type Here"
          />
        </div>
        <div className="addproduct-itemfield">
          <p>Offer Price</p>
          <input
            value={productDetails.new_price}
            onChange={(e) => changeHandler(e.target.value, 'new_price')}
            type="text"
            name="new_price"
            placeholder="Type Here"
          />
        </div>
      </div>
      <div className="addproduct-itemfield">
        <p>Product Category</p>
        <Select
          value={productDetails.category}
          onChange={(value) => changeHandler(value, 'category')}
          name="category"
          className="add-product-selector"
        >
          <Option value="women">Women</Option>
          <Option value="men">Men</Option>
          <Option value="kid">Kid</Option>
        </Select>
      </div>
      <div className="addproduct-itemfield">
        <label htmlFor="file-input">
          <img
            src={image ? URL.createObjectURL(image) : upload_area}
            className="addproduct-thumbnail-image"
            alt=""
          />
        </label>
        <input onChange={imageHandler} type="file" name="image" id="file-input" hidden />
      </div>
      <button onClick={AddProduct} className="addproduct-btn">
        ADD
      </button>
    </div>
  );
};

export default AddProduct;
