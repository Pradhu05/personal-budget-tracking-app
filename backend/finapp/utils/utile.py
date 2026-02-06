class Utils:
    Food=1
    Jewellery=2
    Travel=3
    Shopping=4
    Food_val='Food'
    Jewellery_val='jewellery'
    Travel_val='Travel'
    Shopping_val='shopping'
    type_arr={Food:Food_val,Jewellery:Jewellery_val,Travel:Travel_val,Shopping:Shopping_val}
    @classmethod
    def get_category_name_by_id(cls, id_):
        return cls.type_arr.get(id_)
def categories_details():
    result=[]
    for id_,category in Utils.type_arr.items():
        result.append({
            "id": id_,
            "category": category
         })
    return result