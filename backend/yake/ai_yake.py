import asyncio
import yake


def get_keywords_from_text(text):
    kw_extractor = yake.KeywordExtractor()
    keywords = kw_extractor.extract_keywords(text)
    rspn_dict = {}
    for kw in keywords:
        rspn_dict[kw[0]]=kw[1]
    return rspn_dict



def compare_texts(text1:str,text2:str) -> float:
    """
    :param text1: Teacher note
    :type text1: str
    :param text2: Student note
    :type text2: str
    :return: Points of similar texts.
    :rtype: float
    """
    t1 = get_keywords_from_text(text1)
    t2 = get_keywords_from_text(text2)
    #common = set(t1.keys()) and set(t2.keys())
    #common = set.intersection(*map(set, [t1,t2]))
    common = [key for key in t1.keys() & t2.keys()]
    #print(type(common))
    #print(common)
    score = 0.0
    for e in common:
        score += abs(t1[e]-t2[e])
    uncommon = set(t1.keys()) ^ set(common)
    for e in uncommon:
        score += 1/(abs(t1[e]))
    return score

    
        
    
