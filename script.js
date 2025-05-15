let type_qty = document.getElementById("type_qty");

// วนแสดงตัวเลือกใน <select> 10 อัน
for (let i = 2; i <= 10; i++) {
    let option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    type_qty.appendChild(option);
}

// แสดงช่อง form สำหรับเทียบราคา ตามจำนวนที่เลือก
let selected_qty;
document.getElementById('type_qty').addEventListener('change', function() {
    selected_qty = parseInt(this.value);
    let tb_body = document.getElementById('tb_body');
    
    tb_body.innerHTML = ""; 

    for(let i = 1; i <= selected_qty; i++) {
        const row = document.createElement('tr');

        row.innerHTML = `
                <td>แบบที่ ${i}</td>
                <td>
                    <input type="number" class="form-control" name="price_${i}" id="price_${i}" placeholder="0.00" required>
                </td>
                <td>
                    <input type="number" class="form-control" name="unit_${i}" id="unit_${i}" placeholder="(ปริมาณ,ชิ้น)" required>
                </td>
                <td>
                    <input type="text" class="form-control" id="unit_price_${i}" disabled >
                </td>
            `;
        tb_body.appendChild(row);
    }
});

function num_format(num, decimals) {
    if(Number.isInteger(num)) {
        return num;
    } else {
        return num.toFixed(decimals);
    }
}


// ---- เปรียบเทียบราคา ----

let items = [];

// เมื่อมีการกรอกในช่อง input
document.getElementById('compare_form').addEventListener('input', function() {
    // จำนวนที่ต้องการเปรียบเทียบ
    let selected_qty = parseInt(document.getElementById('type_qty').value);
    
    for(let i = 1; i <= selected_qty; i++) {
        //  วนรับค่าจาก input ตามจำนวนที่เลือก
        let price = parseFloat(document.getElementById(`price_${i}`).value);
        let unit = parseFloat(document.getElementById(`unit_${i}`).value);

        // ถ้ากรอกค่าใน input ทั้งสองแล้ว
        if(price > 0 && unit > 0) {
            // แสดงราคาต่อหน่วย
            unit_price = num_format(price / unit, 4);
            document.getElementById(`unit_price_${i}`).value = unit_price;
        } else {
            // ถ้าไม่มีค่าให้ลบค่าในช่องราคาต่อหน่วย
            document.getElementById(`unit_price_${i}`).value = "";
        }

        // เก็บค่าแต่ละแบบเป็นชุด
        items[i - 1] = {
            type: i,
            price: price,
            unit: unit,
            unit_price: unit_price
        };

        // เมื่อมีค่าที่กรอกมาครบอย่างน้อย 1 ค่า
        if(items.length > 0) {
            // เรียงจากน้อยไปมากด้วยราคาต่อหน่วย (... คือคัดลอกลง array ใหม่)
            let sort_items = [...items].sort((a, b) => a.unit_price - b.unit_price);

            // เอาราคาต่อหน่วยที่ถูกที่สุดจากอันแรกใน array
            let cheapest_unite_price = sort_items[0].unit_price;
            
            // วนเช็คแต่ละค่า แล้วเทียบกับราคาต่อหน่วยที่ถูกที่สุด ถ้าใช่ก็จะเก็บแยกไว้
            let cheapest_list = sort_items.filter(item => item.unit_price == cheapest_unite_price);
            
            // console.log("ราคาถูกที่สุด: " + cheapest_unite_price);
            // console.table(items);
            document.querySelectorAll('.cheapest').forEach(el => {
                // แสดงแบบที่ราคาถูกที่สุดทั้งหมด
                el.innerHTML = cheapest_list.map(item => item.type).join(", ");
            });
            
            // console.log('items - ', items.length, '| cheapest_list -', cheapest_list.length);
            // เช็คขนาดใน array ระหว่างอันที่เก็บข้อมูลราคาทั้งหมด กับอันที่เก็บเฉพาะราคาถูกที่สุด
            if(items.length === cheapest_list.length) {
                // ถ้าขนาดเท่ากันแสดงว่า ราคาทุกแบบเท่ากัน ก็จะไม่แสดงแบบที่สอง
                document.getElementById('second_cheap').hidden = true;
                document.getElementById('sum').hidden = true;
            } else {
                // ถ้าขนาดไม่เท่ากันแสดงว่า มีราคาถูกรองลงมา
                document.getElementById('second_cheap').hidden = false;
                document.getElementById('sum').hidden = false;

                // เอาตำแหน่งถัดไปใน sort_items ตามจำนวนที่มีอยู่ใน cheapest_list (เท่ากับจะเอา index ที่ถัดจากตำแหน่งที่ราคาถูกสุด)
                let second_cheap = sort_items[cheapest_list.length]; // จะได้ราคาที่ถูกรองลงมา

                // เอาราคาต่อหน่วยใน sort_items มาเช็คว่าเท่ากับราคาที่ถูกรองลงมาไหม ถ้าเท่าก็จะเก็บแยกไว้
                let second_cheap_item = sort_items.filter(item => item.unit_price == second_cheap.unit_price);

                // กำหนดแบบที่ถูกรองลงมาทั้งหมด
                document.getElementById('second_cheap').innerHTML = `แบบที่ ${second_cheap_item.map(item => item.type).join(", ")} ถูกรองลงมา`;

                // ตำแหน่งสุดท้ายใน sort_items ก็จะเป็นราคาที่แพงที่สุด
                let expensive = sort_items[sort_items.length - 1];
                // document.getElementById('expensive').innerHTML = expensive.type;
                document.querySelectorAll('.expensive').forEach(el => {
                    el.innerHTML = expensive.type;
                });

                // กำหนดความต่างราคาระหว่างถูกสุดกับแพงสุด
                let price_difference = expensive.unit_price - cheapest_unite_price;
                document.getElementById('cheap_per_unit').innerHTML = `${num_format(price_difference, 2)} บาท`;
                document.getElementById('cheap_persent').innerHTML = `${num_format((price_difference / expensive.unit_price) * 100 , 2)} %`;

                // จำนวนหน่วย ของราคาที่ถูกที่สุด
                document.getElementById('cheapest_unit').innerHTML = sort_items[0].unit;

                // กำหนดราคาที่ประหยัดได้ เมื่อซื้ออันที่แพงสุดในจำนวนที่เท่ากับอันที่ถูกสุด
                let money_save = (expensive.unit_price * sort_items[0].unit) - sort_items[0].price;
                document.getElementById('money_save').innerHTML = `${num_format(money_save, 2)} บาท`;


            }

        }
    }

});
