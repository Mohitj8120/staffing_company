import copy

def compute_dict_diff(base: dict, target: dict) -> dict:
    """
    Computes a delta dict representing changes from base to target.
    Keys present in target but different/missing in base are recorded.
    Special token "__deleted__" represents deleted keys/elements.
    """
    diff = {}
    if not isinstance(base, dict) or not isinstance(target, dict):
        return target
        
    # 1. Check for deleted keys
    for k in base:
        if k not in target:
            diff[k] = "__deleted__"
            
    # 2. Check for added/modified keys
    for k, v in target.items():
        if k not in base:
            diff[k] = copy.deepcopy(v)
        else:
            base_v = base[k]
            if type(v) != type(base_v):
                diff[k] = copy.deepcopy(v)
            elif isinstance(v, dict):
                sub_diff = compute_dict_diff(base_v, v)
                if sub_diff:
                    diff[k] = sub_diff
            elif isinstance(v, list):
                if v != base_v:
                    diff[k] = copy.deepcopy(v)
            else:
                if v != base_v:
                    diff[k] = v
                    
    return diff

def apply_dict_patch(base: dict, patch: dict) -> dict:
    """
    Applies a delta patch dict to base to reconstruct the target.
    """
    if not isinstance(base, dict) or not isinstance(patch, dict):
        return patch
        
    result = copy.deepcopy(base)
    
    for k, v in patch.items():
        if v == "__deleted__":
            if k in result:
                del result[k]
        elif k in result and isinstance(v, dict) and isinstance(result[k], dict):
            result[k] = apply_dict_patch(result[k], v)
        else:
            result[k] = copy.deepcopy(v)
            
    return result
